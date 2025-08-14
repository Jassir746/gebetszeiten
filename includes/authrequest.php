<?php
function isAuthorizedRequest(string $modusflag, string $allowedRefererDomain, string $validApiKey): bool
{
    switch ($modusflag) {
        case 'local':
            return true;

        case 'webspace':
            $referer = $_SERVER['HTTP_REFERER'] ?? '';
            $apiKey  = $_SERVER['HTTP_X_API_KEY'] ?? '';

            $refererHost = parse_url($referer, PHP_URL_HOST) ?? '';
            $isWebClient = strcasecmp($refererHost, $allowedRefererDomain) === 0;
            $isAppClient = $apiKey === $validApiKey;

            return $isWebClient || $isAppClient;

        default:
            http_response_code(403);
            echo json_encode(["error" => "Zugriff verweigert, wrong referer or apiKey"]);
            exit;
    }
}

?>
