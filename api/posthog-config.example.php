<?php
/**
 * PostHog Configuration - EXAMPLE FILE
 * Copy this to posthog-config.php and add your actual API keys
 * 
 * IMPORTANT: posthog-config.php is gitignored to protect your keys!
 */

return [
    // Your PostHog Project API Key
    // Get this from: PostHog Dashboard > Project Settings > Project API Key
    'api_key' => 'phc_YOUR_PROJECT_API_KEY_HERE',

    // Your PostHog Personal API Key (for fetching data)
    // Get this from: PostHog Dashboard > Settings > Personal API Keys
    'personal_api_key' => 'phx_YOUR_PERSONAL_API_KEY_HERE',

    // PostHog Host (use US or EU cloud, or self-hosted URL)
    'host' => 'https://us.i.posthog.com',

    // Project ID (for API queries)
    // Find in: PostHog Dashboard URL (e.g., /project/12345/)
    'project_id' => 'YOUR_PROJECT_ID',

    // Cron sync secret key (protect the HTTP endpoint)
    // Generate a random string, e.g.: bin2hex(random_bytes(32))
    'cron_secret_key' => 'YOUR_RANDOM_SECRET_KEY_HERE',

    // Enable/disable PostHog tracking
    'enabled' => true
];
