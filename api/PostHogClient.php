<?php
/**
 * PostHog Analytics Client
 * Lightweight cURL-based client for PostHog API (no Composer required)
 * 
 * InfinityFree compatible - uses only curl_init/curl_exec
 */

class PostHogClient
{
    private $apiKey;
    private $host;
    private $enabled;

    /**
     * Initialize PostHog client
     * @param string|null $apiKey - PostHog project API key (optional, reads from config)
     * @param string $host - PostHog host URL
     */
    public function __construct($apiKey = null, $host = 'https://us.i.posthog.com')
    {
        // Try to load from environment or config
        $this->apiKey = $apiKey ?? $this->getApiKeyFromConfig();
        $this->host = rtrim($host, '/');
        $this->enabled = !empty($this->apiKey);

        if (!$this->enabled) {
            error_log('PostHog: API key not configured, analytics disabled');
        }
    }

    /**
     * Get API key from config file
     */
    private function getApiKeyFromConfig()
    {
        $configFile = __DIR__ . '/posthog-config.php';
        if (file_exists($configFile)) {
            $config = include $configFile;
            return $config['api_key'] ?? null;
        }
        return null;
    }

    /**
     * Capture an event
     * @param string $distinctId - User's distinct ID (from frontend or generated)
     * @param string $event - Event name (e.g., 'guestbook_signed')
     * @param array $properties - Event properties
     * @return bool - Success status
     */
    public function capture($distinctId, $event, $properties = [])
    {
        if (!$this->enabled || empty($distinctId)) {
            return false;
        }

        $payload = [
            'api_key' => $this->apiKey,
            'event' => $event,
            'properties' => array_merge($properties, [
                'distinct_id' => $distinctId,
                '$lib' => 'php-curl',
                '$lib_version' => '1.0.0'
            ]),
            'timestamp' => date('c')
        ];

        return $this->sendRequest('/capture/', $payload);
    }

    /**
     * Identify a user (set user properties)
     * @param string $distinctId - User's distinct ID
     * @param array $properties - User properties (email, name, etc.)
     * @return bool - Success status
     */
    public function identify($distinctId, $properties = [])
    {
        if (!$this->enabled || empty($distinctId)) {
            return false;
        }

        $payload = [
            'api_key' => $this->apiKey,
            'event' => '$identify',
            'properties' => [
                'distinct_id' => $distinctId,
                '$set' => $properties
            ],
            'timestamp' => date('c')
        ];

        return $this->sendRequest('/capture/', $payload);
    }

    /**
     * Alias two distinct IDs together
     * Used to link anonymous visitor to authenticated user
     * @param string $distinctId - Current distinct ID
     * @param string $alias - New alias (e.g., user email or database ID)
     * @return bool - Success status
     */
    public function alias($distinctId, $alias)
    {
        if (!$this->enabled || empty($distinctId) || empty($alias)) {
            return false;
        }

        $payload = [
            'api_key' => $this->apiKey,
            'event' => '$create_alias',
            'properties' => [
                'distinct_id' => $distinctId,
                'alias' => $alias
            ],
            'timestamp' => date('c')
        ];

        return $this->sendRequest('/capture/', $payload);
    }

    /**
     * Send request to PostHog API using cURL
     * @param string $endpoint - API endpoint
     * @param array $payload - Request payload
     * @return bool - Success status
     */
    private function sendRequest($endpoint, $payload)
    {
        $url = $this->host . $endpoint;
        $jsonPayload = json_encode($payload);

        $ch = curl_init();

        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $jsonPayload,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Content-Length: ' . strlen($jsonPayload)
            ],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 5, // Short timeout to not block requests
            CURLOPT_CONNECTTIMEOUT => 3,
            // Disable SSL verification for local development (InfinityFree has proper certs)
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);

        curl_close($ch);

        if ($error) {
            error_log("PostHog cURL error: $error");
            return false;
        }

        if ($httpCode >= 200 && $httpCode < 300) {
            return true;
        }

        error_log("PostHog API error: HTTP $httpCode - $response");
        return false;
    }

    /**
     * Check if PostHog is enabled
     * @return bool
     */
    public function isEnabled()
    {
        return $this->enabled;
    }

    /**
     * Fetch data from PostHog API (for sync operations)
     * @param string $endpoint - API endpoint (e.g., '/api/persons/')
     * @param array $params - Query parameters
     * @return array|null - Response data or null on error
     */
    public function fetchApi($endpoint, $params = [])
    {
        if (!$this->enabled) {
            return null;
        }

        $url = $this->host . $endpoint;
        if (!empty($params)) {
            $url .= '?' . http_build_query($params);
        }

        $ch = curl_init();

        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $this->apiKey,
                'Content-Type: application/json'
            ],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 25, // Longer timeout for read operations
            CURLOPT_CONNECTTIMEOUT => 5,
            // Disable SSL verification for local development
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);

        curl_close($ch);

        if ($error) {
            error_log("PostHog fetch error: $error");
            return null;
        }

        if ($httpCode >= 200 && $httpCode < 300) {
            return json_decode($response, true);
        }

        error_log("PostHog fetch API error: HTTP $httpCode");
        return null;
    }
}
