<?php
require_once '../config.php';

$method = $_SERVER['REQUEST_METHOD'];
$requestUri = $_SERVER['REQUEST_URI'];
// Robust Router for cPanel
$path = parse_url($requestUri, PHP_URL_PATH);
// This finds the part of the URL after '/api' correctly even in subfolders
$route = '';
if (preg_match('/\/api(\/.*)$/', $path, $matches)) {
    $route = $matches[1];
} else if (strpos($path, '/api') === false) {
    // If '/api' is missing but we're in the api folder, just use the path relative to it
    $route = $path;
}

// Ensure route starts with / but doesn't end with / (unless it's just /)
$route = '/' . ltrim($route, '/');

$db = getDB();

switch (true) {
    // Health Check
    case $route === '/health':
        echo json_encode(["status" => "ok", "message" => "PHP Backend is online", "database" => "MySQL"]);
        break;

    // Login API
    case $route === '/auth/login' && $method === 'POST':
        $data = getJSONInput();
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        $stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            // Simplified token for PHP version
            $token = base64_encode(json_encode(['id' => $user['id'], 'email' => $user['email'], 'exp' => time() + (86400 * 7)]));
            echo json_encode(["token" => $token, "user" => ["email" => $user['email']]]);
        } else {
            http_response_code(401);
            echo json_encode(["message" => "Invalid email or password"]);
        }
        break;

    case $route === '/auth/home-verify' && $method === 'POST':
        $data = getJSONInput();
        $password = $data['password'] ?? '';
        
        $stmt = $db->prepare("SELECT value FROM settings WHERE `key` = 'homePassword'");
        $stmt->execute();
        $setting = $stmt->fetch();

        if ($password === $setting['value']) {
            echo json_encode(["success" => true]);
        } else {
            http_response_code(401);
            echo json_encode(["message" => "Incorrect access PIN"]);
        }
        break;

    // Categories
    case $route === '/categories':
        if ($method === 'GET') {
            $stmt = $db->query("SELECT * FROM categories");
            echo json_encode($stmt->fetchAll());
        } elseif ($method === 'POST') {
            authenticate();
            $data = getJSONInput();
            $id = bin2hex(random_bytes(4));
            $stmt = $db->prepare("INSERT INTO categories (id, name, slug) VALUES (?, ?, ?)");
            $stmt->execute([$id, $data['name'], $data['slug']]);
            echo json_encode(["id" => $id, "name" => $data['name'], "slug" => $data['slug']]);
        }
        break;

    // Books
    case $route === '/books':
        if ($method === 'GET') {
            $featured = $_GET['featured'] ?? null;
            $categoryId = $_GET['categoryId'] ?? null;
            $hidden = $_GET['hidden'] ?? null;

            $sql = "SELECT * FROM books WHERE 1=1";
            $params = [];

            if ($featured === 'true') {
                $sql .= " AND featured = 1";
            }
            if ($categoryId) {
                $sql .= " AND categoryId = ?";
                $params[] = $categoryId;
            }
            if ($hidden === 'false') {
                $sql .= " AND hidden = 0";
            }

            $sql .= " ORDER BY createdAt DESC";
            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            $books = $stmt->fetchAll();

            // Convert to proper types for frontend
            foreach ($books as &$book) {
                $book['featured'] = (bool)$book['featured'];
                $book['hidden'] = (bool)$book['hidden'];
            }
            echo json_encode($books);
        } elseif ($method === 'POST') {
            authenticate();
            $data = getJSONInput();
            $id = $data['id'] ?? bin2hex(random_bytes(4));
            $createdAt = round(microtime(true) * 1000);

            $stmt = $db->prepare("INSERT INTO books (id, title, thumbnailUrl, fileType, previewUrl, downloadUrl, categoryId, driveFileId, featured, hidden, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $id,
                $data['title'],
                $data['thumbnailUrl'] ?? '',
                $data['fileType'] ?? 'PDF',
                $data['previewUrl'] ?? '',
                $data['downloadUrl'] ?? '',
                $data['categoryId'] ?? 'cat1',
                $data['driveFileId'] ?? null,
                ($data['featured'] ?? false) ? 1 : 0,
                ($data['hidden'] ?? false) ? 1 : 0,
                $createdAt
            ]);
            
            $data['id'] = $id;
            $data['createdAt'] = $createdAt;
            echo json_encode($data);
        }
        break;

    // Specific Book (PUT/DELETE)
    case preg_match('/^\/books\/([a-zA-Z0-9]+)$/', $route, $matches):
        $bookId = $matches[1];
        authenticate();
        if ($method === 'PUT') {
            $data = getJSONInput();
            $fields = [];
            $params = [];
            foreach ($data as $key => $value) {
                if ($key === 'id') continue;
                if ($key === 'featured' || $key === 'hidden') $value = $value ? 1 : 0;
                $fields[] = "`$key` = ?";
                $params[] = $value;
            }
            $params[] = $bookId;
            $stmt = $db->prepare("UPDATE books SET " . implode(', ', $fields) . " WHERE id = ?");
            $stmt->execute($params);
            echo json_encode(["message" => "Book updated"]);
        } elseif ($method === 'DELETE') {
            $stmt = $db->prepare("DELETE FROM books WHERE id = ?");
            $stmt->execute([$bookId]);
            echo json_encode(["message" => "Book deleted"]);
        }
        break;

    // Settings
    case $route === '/settings':
        if ($method === 'GET') {
            $stmt = $db->query("SELECT * FROM settings");
            $settings = $stmt->fetchAll();
            $config = [];
            foreach ($settings as $s) {
                $config[$s['key']] = $s['value'];
            }
            echo json_encode($config);
        } elseif ($method === 'POST') {
            authenticate();
            $updates = getJSONInput();
            
            foreach ($updates as $key => $value) {
                if ($key === 'adminEmail' || $key === 'adminPassword') {
                    if ($key === 'adminEmail') {
                        $stmt = $db->prepare("UPDATE users SET email = ? WHERE id = 'admin'");
                        $stmt->execute([$value]);
                    } else {
                        $hash = password_hash($value, PASSWORD_DEFAULT);
                        $stmt = $db->prepare("UPDATE users SET password = ? WHERE id = 'admin'");
                        $stmt->execute([$hash]);
                    }
                } else {
                    $stmt = $db->prepare("UPDATE settings SET value = ? WHERE `key` = ?");
                    $stmt->execute([$value, $key]);
                }
            }
            echo json_encode(["message" => "Settings updated"]);
        }
        break;

    // Drive Sync (Simple API Key version)
    case $route === '/drive/sync-folder' && $method === 'POST':
        authenticate();
        $data = getJSONInput();
        $folderId = $data['folderId'] ?? '';
        $apiKey = $data['apiKey'] ?? '';
        $categoryId = $data['categoryId'] ?? 'cat1';

        if (!$folderId || !$apiKey) {
            http_response_code(400);
            echo json_encode(["message" => "Missing Folder ID or API Key"]);
            break;
        }

        $url = "https://www.googleapis.com/drive/v3/files?q=" . urlencode("'$folderId' in parents and trashed = false") . "&fields=" . urlencode("files(id, name, mimeType, thumbnailLink, webViewLink, webContentLink)") . "&key=$apiKey";
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        $response = curl_exec($ch);
        curl_close($ch);
        
        $resData = json_decode($response, true);
        $files = $resData['files'] ?? [];
        $imported = 0;
        $skipped = 0;

        foreach ($files as $file) {
            $mime = $file['mimeType'] ?? '';
            if (strpos($mime, 'pdf') === false && strpos($mime, 'epub') === false && strpos($mime, 'application/octet-stream') === false) {
                $skipped++;
                continue;
            }

            $stmt = $db->prepare("SELECT id FROM books WHERE driveFileId = ?");
            $stmt->execute([$file['id']]);
            if ($stmt->fetch()) {
                $skipped++;
                continue;
            }

            $id = bin2hex(random_bytes(4));
            $stmt = $db->prepare("INSERT INTO books (id, title, thumbnailUrl, fileType, previewUrl, downloadUrl, categoryId, driveFileId, featured, hidden, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?)");
            $stmt->execute([
                $id,
                preg_replace('/\.[^.]+$/', '', $file['name'] ?? 'Untitled'),
                $file['thumbnailLink'] ?? 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=300',
                strpos($mime, 'pdf') !== false ? 'PDF' : 'ASSET',
                $file['webViewLink'] ?? '',
                $file['webContentLink'] ?? ($file['webViewLink'] ?? ''),
                $categoryId,
                $file['id'],
                round(microtime(true) * 1000)
            ]);
            $imported++;
        }

        echo json_encode(["success" => true, "imported" => $imported, "skipped" => $skipped, "total" => count($files)]);
        break;

    // Fallback
    default:
        http_response_code(404);
        echo json_encode(["message" => "API endpoint not found: " . $route]);
        break;
}
?>
