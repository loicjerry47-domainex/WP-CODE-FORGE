export const meridianFiles: Record<string, string> = {
  'style.css': `/*
Theme Name: Meridian
Theme URI: https://wxza.net
Author: Loic Hazoume
Author URI: https://wxza.net
Description: A conversion-focused WordPress theme for SaaS, agencies, and startups. Features a custom landing page builder, testimonial system, pricing tables, and full Customizer integration.
Version: 1.0.0
Requires PHP: 7.4
License: GPL-2.0-or-later
Text Domain: meridian
*/

:root {
  --mer-bg: #fafafa;
  --mer-accent-primary: #6366f1;
  --mer-accent-secondary: #8b5cf6;
  --mer-success: #22c55e;
  --mer-text: #1a1a2e;
  --mer-border: #e5e7eb;
  --mer-radius-card: 12px;
  --mer-radius-btn: 8px;
}

body.dark-mode {
  --mer-bg: #0f1117;
  --mer-text: #f0f0f5;
  --mer-border: #2a2a3a;
}

body {
  background-color: var(--mer-bg);
  color: var(--mer-text);
  font-family: 'Inter', sans-serif;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.button {
  background-color: var(--mer-accent-primary);
  color: white;
  border-radius: var(--mer-radius-btn);
  padding: 10px 20px;
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.card {
  border-radius: var(--mer-radius-card);
  border: 1px solid var(--mer-border);
  padding: 20px;
}
`,

  'functions.php': `<?php
/**
 * Meridian functions and definitions
 */

function meridian_setup() {
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'custom-logo' );
	add_theme_support( 'html5', array( 'search-form', 'comment-form' ) );
}
add_action( 'after_setup_theme', 'meridian_setup' );

function meridian_scripts() {
	wp_enqueue_style( 'meridian-style', get_stylesheet_uri() );
	wp_enqueue_script( 'meridian-dark-mode', get_template_directory_uri() . '/assets/js/dark-mode-toggle.js', array(), '1.0.0', true );
}
add_action( 'wp_enqueue_scripts', 'meridian_scripts' );

// Includes
require get_template_directory() . '/inc/custom-post-types.php';
require get_template_directory() . '/inc/shortcodes.php';
require get_template_directory() . '/inc/customizer.php';
`,

  'inc/custom-post-types.php': `<?php
function meridian_register_cpt() {
    register_post_type('meridian_testimonial', array(
        'labels' => array(
            'name' => __('Testimonials', 'meridian'),
            'singular_name' => __('Testimonial', 'meridian'),
        ),
        'public' => true,
        'has_archive' => false,
        'supports' => array('title', 'editor', 'thumbnail'),
        'menu_icon' => 'dashicons-testimonial',
    ));
}
add_action('init', 'meridian_register_cpt');

function meridian_add_meta_boxes() {
    add_meta_box('meridian_testimonial_details', 'Client Details', 'meridian_testimonial_meta_cb', 'meridian_testimonial', 'normal', 'high');
}
add_action('add_meta_boxes', 'meridian_add_meta_boxes');

function meridian_testimonial_meta_cb($post) {
    wp_nonce_field('meridian_save_meta', 'meridian_meta_nonce');
    $client = get_post_meta($post->ID, '_client_name', true);
    ?>
    <p>
        <label>Client Name:</label>
        <input type="text" name="meridian_client_name" value="<?php echo esc_attr($client); ?>" />
    </p>
    <?php
}

function meridian_save_meta($post_id) {
    if (!isset($_POST['meridian_meta_nonce']) || !wp_verify_nonce($_POST['meridian_meta_nonce'], 'meridian_save_meta')) return;
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!current_user_can('edit_post', $post_id)) return;
    
    if (isset($_POST['meridian_client_name'])) {
        update_post_meta($post_id, '_client_name', sanitize_text_field($_POST['meridian_client_name']));
    }
}
add_action('save_post', 'meridian_save_meta');
`,

  'front-page.php': `<?php get_header(); ?>
<main id="primary" class="site-main">
    <?php get_template_part('template-parts/hero', 'saas'); ?>
    <?php get_template_part('template-parts/section', 'clients'); ?>
    
    <div class="container section">
        <h2>Pricing</h2>
        <?php echo do_shortcode('[meridian_pricing]'); ?>
    </div>
    
    <div class="container section">
        <h2>What our users say</h2>
        <?php echo do_shortcode('[meridian_testimonials count="3"]'); ?>
    </div>
</main>
<?php get_footer(); ?>
`,
};
