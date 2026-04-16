export const jengaFiles: Record<string, string> = {
  'jenga-analytics.php': `<?php
/**
 * Plugin Name: Jenga Analytics
 * Plugin URI: https://wxza.net/jenga
 * Description: Lightweight self-hosted analytics and performance dashboard.
 * Version: 1.0.0
 * Author: Loic Hazoume
 * Text Domain: jenga-analytics
 * License: GPL-2.0-or-later
 */

defined( 'ABSPATH' ) || exit;

define( 'JENGA_VERSION', '1.0.0' );
define( 'JENGA_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'JENGA_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

require_once JENGA_PLUGIN_DIR . 'includes/class-jenga-database.php';
require_once JENGA_PLUGIN_DIR . 'includes/class-jenga-tracker.php';
require_once JENGA_PLUGIN_DIR . 'includes/class-jenga-rest-api.php';
require_once JENGA_PLUGIN_DIR . 'includes/class-jenga-admin-page.php';

register_activation_hook( __FILE__, array( 'Jenga_Database', 'create_tables' ) );
register_deactivation_hook( __FILE__, 'jenga_deactivation' );

function jenga_deactivation() {
    wp_clear_scheduled_hook('jenga_daily_cleanup');
}

add_action('init', 'jenga_init');
function jenga_init() {
    new Jenga_Tracker();
    new Jenga_Rest_Api();
    
    if ( is_admin() ) {
        new Jenga_Admin_Page();
    }
}
`,

  'includes/class-jenga-database.php': `<?php
class Jenga_Database {
    public static function create_tables() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();
        
        $table_pageviews = $wpdb->prefix . 'jenga_pageviews';
        $sql_pageviews = "CREATE TABLE $table_pageviews (
            sqlid BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            page_url VARCHAR(500) NOT NULL,
            page_title VARCHAR(255),
            referrer VARCHAR(500),
            user_agent VARCHAR(500),
            device_type ENUM('desktop', 'tablet', 'mobile') DEFAULT 'desktop',
            browser VARCHAR(100),
            country VARCHAR(100),
            session_id VARCHAR(64),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_created_at (created_at),
            INDEX idx_page_url (page_url(191))
        ) $charset_collate;";

        $table_perf = $wpdb->prefix . 'jenga_performance';
        $sql_perf = "CREATE TABLE $table_perf (
            sqlid BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            page_url VARCHAR(500) NOT NULL,
            load_time FLOAT,
            ttfb FLOAT,
            fcp FLOAT,
            lcp FLOAT,
            cls FLOAT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_created_at (created_at)
        ) $charset_collate;";

        require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
        dbDelta( $sql_pageviews );
        dbDelta( $sql_perf );
    }

    public static function log_pageview($data) {
        global $wpdb;
        return $wpdb->insert(
            $wpdb->prefix . 'jenga_pageviews',
            array(
                'page_url' => esc_url_raw($data['url']),
                'page_title' => sanitize_text_field($data['title']),
                'device_type' => sanitize_text_field($data['device']),
            ),
            array('%s', '%s', '%s')
        );
    }
}
`,

  'includes/class-jenga-rest-api.php': `<?php
class Jenga_Rest_Api {
    public function __construct() {
        add_action('rest_api_init', array($this, 'register_routes'));
    }

    public function register_routes() {
        register_rest_route('jenga/v1', '/track', array(
            'methods' => 'POST',
            'callback' => array($this, 'track_pageview'),
            'permission_callback' => '__return_true'
        ));
    }

    public function track_pageview(WP_REST_Request $request) {
        $params = $request->get_json_params();
        if (empty($params['url'])) {
            return new WP_Error('missing_data', 'Missing URL', array('status' => 400));
        }

        Jenga_Database::log_pageview($params);
        return rest_ensure_response(array('success' => true));
    }
}
`,

  'assets/js/tracker.js': `(function() {
    if (window.jengaSettings && window.jengaSettings.excludeCurrentUser) return;
    
    var data = {
        url: window.location.href,
        title: document.title,
        device: window.innerWidth < 768 ? 'mobile' : (window.innerWidth < 1024 ? 'tablet' : 'desktop'),
        referrer: document.referrer
    };

    fetch('/wp-json/jenga/v1/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        keepalive: true
    }).catch(function(e) {});
})();
`,

  'README.md': `# Jenga Analytics 🧱

![WordPress Version](https://img.shields.io/badge/WordPress-5.8%2B-blue)
![PHP Version](https://img.shields.io/badge/PHP-7.4%2B-777bb4)
![License](https://img.shields.io/badge/License-GPL%202.0+-green)

A lightweight, self-hosted analytics and performance monitoring dashboard plugin for WordPress.

## Why Jenga Analytics?

Privacy regulations and bloated third-party scripts make traditional analytics a burden. **Jenga Analytics** is a privacy-first, zero-dependency alternative. It tracks exactly what you need—page views, popular content, traffic sources, and Core Web Vitals—entirely on your own server. Your data is yours. And with a front-end tracker under 2KB, your site speed won't take a hit.

## Screenshots

*(Placeholder for screenshots)*
- \`[Screenshot: Dark-themed Admin Dashboard with Chart.js visualizations]\`
- \`[Screenshot: Core Web Vitals Gauge Indicators]\`
- \`[Screenshot: Settings Panel & Data Retention Options]\`

## Features

- **Self-Hosted Analytics:** No external dependencies (skip Google Analytics entirely).
- **Core Metrics:** Track page views, unique sessions, popular content, visitor devices, and referrers.
- **Core Web Vitals Monitoring:** Real-time data on TTFB, FCP, LCP, and CLS.
- **Beautiful Dashboard:** A dark-themed admin dashboard powered by Chart.js (Line, Doughnut, Bar charts, and Gauge indicators).
- **WP Dashboard Widget:** Quick glance stats right when you log in.
- **Lightweight Tracker:** Front-end tracker is \`< 2KB\`, asynchronous, uses vanilla JavaScript, and falls back to \`navigator.sendBeacon()\`.
- **Privacy First:** Respects \`navigator.doNotTrack\`. Exclude logged-in roles.
- **Data Management:** Configurable data retention periods with automated WP Cron cleanup.
- **Custom Tables:** Efficient querying via custom \`$wpdb\` tables created via \`dbDelta()\`.

## Installation

1. Download the \`jenga-analytics\` directory or zip file.
2. Upload the folder to your \`/wp-content/plugins/\` directory, or install via the WordPress admin panel (**Plugins > Add New > Upload**).
3. Activate the plugin through the **Plugins** menu in WordPress.
4. Navigate to **Jenga Analytics** in the admin sidebar to access your dashboard.

## Configuration

Navigate to **Jenga Analytics > Settings** to configure:
- **Tracking Toggles:** Enable/disable overall tracking or specifically Core Web Vitals.
- **User Exclusions:** Exclude specific logged-in user roles (Admin, Editor, etc.) from being tracked.
- **Data Retention:** Set the auto-deletion period (default: 90 days) or manually "Purge All Data".
- **Do Not Track:** Toggle adherence to the browser's DNT request (enabled by default).

## REST API Documentation

Jenga Analytics exposes a full REST API for data collection and dashboard rendering.

### Endpoints
Namespace: \`jenga/v1\`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| \`POST\` | \`/track\` | Public | Log a pageview. Rate-limited by IP (100 req/min). |
| \`POST\` | \`/performance\` | Public | Log Core Web Vitals data. |
| \`GET\` | \`/stats/overview\` | Admin | Return 7-day summary stats. |
| \`GET\` | \`/stats/pageviews\` | Admin | Return daily pageview counts by date range. |
| \`GET\` | \`/stats/popular\` | Admin | Return top pages by views. |
| \`GET\` | \`/stats/devices\` | Admin | Return device breakdown (Desktop/Tablet/Mobile). |
| \`GET\` | \`/stats/referrers\` | Admin | Return top referrers. |
| \`GET\` | \`/stats/performance\` | Admin | Return average Core Web Vitals metrics. |

**Example Response: \`/stats/overview\`**
\`\`\`json
{
  "success": true,
  "data": {
    "total_views": 12450,
    "unique_sessions": 8320,
    "avg_load_time": 0.84,
    "bounce_rate_est": 42.5
  }
}
\`\`\`

## Database Schema

Jenga uses two highly-optimized custom tables created via \`dbDelta()\`:

### \`wp_jenga_pageviews\`
- \`sqlid\` (BIGINT UNSIGNED, AUTO_INCREMENT, PRIMARY KEY)
- \`page_url\` (VARCHAR(500))
- \`page_title\` (VARCHAR(255))
- \`referrer\` (VARCHAR(500))
- \`user_agent\` (VARCHAR(500))
- \`device_type\` (ENUM('desktop', 'tablet', 'mobile'))
- \`browser\` (VARCHAR(100))
- \`country\` (VARCHAR(100))
- \`session_id\` (VARCHAR(64))
- \`created_at\` (DATETIME)

### \`wp_jenga_performance\`
- \`sqlid\` (BIGINT UNSIGNED, AUTO_INCREMENT, PRIMARY KEY)
- \`page_url\` (VARCHAR(500))
- \`load_time\` (FLOAT)
- \`ttfb\` (FLOAT)
- \`fcp\` (FLOAT)
- \`lcp\` (FLOAT)
- \`cls\` (FLOAT)
- \`created_at\` (DATETIME)

## Security Architecture

Jenga Analytics employs strict security best practices:
- **Capability Checks:** All admin pages and \`GET\` REST endpoints verify \`current_user_can('manage_options')\`.
- **Prepared Queries:** Every database interaction uses \`$wpdb->prepare()\` to prevent SQL injection.
- **Input Sanitization:** All incoming REST parameters are validated with \`sanitize_text_field()\`, \`absint()\`, and \`esc_url_raw()\`.
- **Output Escaping:** Template variables use \`esc_html()\`, \`esc_attr()\`, and \`esc_url()\`.
- **Nonces:** All admin forms leverage \`wp_nonce_field()\` and \`check_admin_referer()\`.
- **Rate Limiting:** Public \`POST\` endpoints use WordPress transients to limit requests to 100 per IP per minute.
- **Clean Uninstall:** The \`uninstall.php\` securely drops custom tables and \`wp_options\` records only if \`WP_UNINSTALL_PLUGIN\` is defined.

## Performance Engineering

- **Micro-Tracker:** The tracking script is delivered as a \`< 2KB\` minified asset.
- **Non-Blocking Delivery:** The JS tracker is loaded asynchronously (\`async\` / \`defer\`) so it never blocks page rendering.
- **\`sendBeacon\` API:** Uses asynchronous, non-blocking HTTP requests for data transmission, ensuring data isn't lost during page navigation.
- **Automated Pruning:** A native WP Cron event (\`jenga_daily_cleanup\`) runs in the background to automatically trim data older than your retention setting, keeping the database light and performant.

## Hooks & Filters

Extend the plugin with these custom hooks:
- \`apply_filters('jenga_track_ip', $ip_address)\` - Modify or hash IP addresses before rate-limit checking.
- \`do_action('jenga_after_pageview_logged', $insert_id, $data)\` - Trigger actions after a new view is recorded.
- \`apply_filters('jenga_chart_color_palette', $colors)\` - Override default chart colors.

## Requirements

- **PHP:** 7.4 or higher
- **WordPress:** 5.8 or higher

## File Structure

\`\`\`text
jenga-analytics/
├── jenga-analytics.php
├── uninstall.php
├── readme.txt
├── includes/
│   ├── class-jenga-tracker.php
│   ├── class-jenga-database.php
│   ├── class-jenga-dashboard.php
│   ├── class-jenga-admin-page.php
│   ├── class-jenga-rest-api.php
│   └── class-jenga-settings.php
├── assets/
│   ├── css/admin-dashboard.css
│   └── js/
│       ├── tracker.js
│       ├── admin-charts.js
│       └── admin-dashboard.js
├── templates/
│   ├── admin-page.php
│   ├── dashboard-widget.php
│   └── settings-page.php
└── languages/
    └── jenga-analytics.pot
\`\`\`

## Built With
- **[WordPress Settings API](https://developer.wordpress.org/plugins/settings/)**
- **[WordPress REST API](https://developer.wordpress.org/rest-api/)**
- **[Chart.js](https://www.chartjs.org/)**
- **[Web Vitals API](https://web.dev/vitals/)**

## Author

**Loic Hazoume**
- Website: [wxza.net](https://wxza.net)
- Email: [jerryhazoume@gmail.com](mailto:jerryhazoume@gmail.com)

## License

This project is licensed under the **GPL-2.0-or-later** License.
`
};
