export const obsidianFiles: Record<string, string> = {
  'style.css': `/*
Theme Name: Obsidian
Theme URI: https://wxza.net
Author: Loic Hazoume
Author URI: https://wxza.net
Description: A premium dark-mode WordPress theme for creative professionals and tech companies. Features custom page templates, widget areas, and full Customizer integration.
Version: 1.0.0
Requires PHP: 7.4
License: GPL-2.0-or-later
Text Domain: obsidian
*/

:root {
  --obs-bg-primary: #0a0a0f;
  --obs-bg-secondary: #12121a;
  --obs-bg-card: #1a1a26;
  --obs-accent-primary: #c9a44a;
  --obs-accent-secondary: #e0c472;
  --obs-text-primary: #f0f0f5;
  --obs-text-secondary: #9999aa;
  --obs-border: #2a2a3a;
  --obs-font: 'Inter', sans-serif;
}

body {
  background-color: var(--obs-bg-primary);
  color: var(--obs-text-primary);
  font-family: var(--obs-font);
  margin: 0;
  -webkit-font-smoothing: antialiased;
}

a {
  color: var(--obs-accent-primary);
  text-decoration: none;
  transition: color 0.3s ease;
}

a:hover {
  color: var(--obs-accent-secondary);
}

.screen-reader-text {
  border: 0;
  clip: rect(1px, 1px, 1px, 1px);
  clip-path: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  width: 1px;
  word-wrap: normal !important;
}

*:focus-visible {
  outline: 2px solid var(--obs-accent-primary);
  outline-offset: 2px;
}
`,

  'functions.php': `<?php
/**
 * Obsidian functions and definitions
 */

if ( ! defined( 'OBSIDIAN_VERSION' ) ) {
	define( 'OBSIDIAN_VERSION', '1.0.0' );
}

function obsidian_setup() {
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'custom-logo', array(
		'height'      => 80,
		'width'       => 200,
		'flex-width'  => true,
		'flex-height' => true,
	) );
	add_theme_support( 'html5', array(
		'search-form',
		'comment-form',
		'comment-list',
		'gallery',
		'caption',
		'script',
		'style',
	) );
	add_theme_support( 'customize-selective-refresh-widgets' );
	add_theme_support( 'editor-styles' );
	add_theme_support( 'responsive-embeds' );
	add_theme_support( 'custom-background' );

    // Register image sizes
    add_image_size( 'obsidian-card', 600, 400, true );
    add_image_size( 'obsidian-hero', 1920, 800, true );

	register_nav_menus( array(
		'primary' => esc_html__( 'Header Menu', 'obsidian' ),
		'footer'  => esc_html__( 'Footer Menu', 'obsidian' ),
		'social'  => esc_html__( 'Social Links', 'obsidian' ),
	) );
}
add_action( 'after_setup_theme', 'obsidian_setup' );

function obsidian_scripts() {
	wp_enqueue_style( 'obsidian-fonts', 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap', array(), null );
	wp_enqueue_style( 'obsidian-style', get_stylesheet_uri(), array(), OBSIDIAN_VERSION );
	wp_enqueue_style( 'obsidian-custom', get_template_directory_uri() . '/assets/css/custom.css', array('obsidian-style'), OBSIDIAN_VERSION );

	wp_enqueue_script( 'obsidian-navigation', get_template_directory_uri() . '/assets/js/navigation.js', array('jquery'), OBSIDIAN_VERSION, true );
	wp_enqueue_script( 'obsidian-animations', get_template_directory_uri() . '/assets/js/animations.js', array(), OBSIDIAN_VERSION, true );

    // Use defer for animations
    add_filter('script_loader_tag', function($tag, $handle) {
        if ('obsidian-animations' !== $handle) return $tag;
        return str_replace(' src', ' defer="defer" src', $tag);
    }, 10, 2);

	if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
		wp_enqueue_script( 'comment-reply' );
	}
}
add_action( 'wp_enqueue_scripts', 'obsidian_scripts' );

function obsidian_widgets_init() {
	register_sidebar( array(
		'name'          => esc_html__( 'Main Sidebar', 'obsidian' ),
		'id'            => 'sidebar-1',
		'description'   => esc_html__( 'Add widgets here.', 'obsidian' ),
		'before_widget' => '<section id="%1$s" class="widget %2$s">',
		'after_widget'  => '</section>',
		'before_title'  => '<h2 class="widget-title">',
		'after_title'   => '</h2>',
	) );
    // Footer columns
    for ($i = 1; $i <= 3; $i++) {
        register_sidebar( array(
            'name'          => sprintf( esc_html__( 'Footer Column %d', 'obsidian' ), $i ),
            'id'            => 'footer-' . $i,
            'before_widget' => '<div id="%1$s" class="widget %2$s">',
            'after_widget'  => '</div>',
            'before_title'  => '<h3 class="widget-title">',
            'after_title'   => '</h3>',
        ) );
    }
}
add_action( 'widgets_init', 'obsidian_widgets_init' );

// Excerpt length filter
function obsidian_custom_excerpt_length( $length ) {
    return 25;
}
add_filter( 'excerpt_length', 'obsidian_custom_excerpt_length', 999 );

function obsidian_excerpt_more( $more ) {
    if ( ! is_single() ) {
        $more = sprintf( '... <a class="read-more" href="%1$s">%2$s</a>',
            get_permalink( get_the_ID() ),
            __( 'Read More &rarr;', 'obsidian' )
        );
    }
    return $more;
}
add_filter( 'excerpt_more', 'obsidian_excerpt_more' );

require get_template_directory() . '/inc/customizer.php';
require get_template_directory() . '/inc/widgets.php';
require get_template_directory() . '/inc/template-tags.php';
`,

  'header.php': `<!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="profile" href="https://gmpg.org/xfn/11">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<div id="page" class="site">
	<a class="skip-link screen-reader-text" href="#primary"><?php esc_html_e( 'Skip to content', 'obsidian' ); ?></a>

	<header id="masthead" class="site-header">
		<div class="header-container">
            <div class="site-branding">
                <?php
                if ( has_custom_logo() ) :
                    the_custom_logo();
                else :
                    ?>
                    <h1 class="site-title"><a href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home"><?php bloginfo( 'name' ); ?></a></h1>
                <?php endif; ?>
            </div>

            <nav id="site-navigation" class="main-navigation" aria-label="<?php esc_attr_e( 'Primary menu', 'obsidian' ); ?>">
                <button class="menu-toggle" aria-controls="primary-menu" aria-expanded="false">
                    <span class="hamburger"></span>
                    <span class="screen-reader-text"><?php esc_html_e( 'Primary Menu', 'obsidian' ); ?></span>
                </button>
                <?php
                wp_nav_menu( array(
                    'theme_location' => 'primary',
                    'menu_id'        => 'primary-menu',
                    'container_class'=> 'menu-wrapper'
                ) );
                ?>
            </nav>

            <div class="header-cta">
                <a href="<?php echo esc_url(get_theme_mod('obsidian_hero_btn_url', '#')); ?>" class="button primary">
                    <?php echo esc_html(get_theme_mod('obsidian_hero_btn_text', 'View Our Work')); ?>
                </a>
            </div>
        </div>
	</header>
`,

  'footer.php': `	<footer id="colophon" class="site-footer">
		<div class="footer-widgets">
            <div class="footer-col"><?php dynamic_sidebar('footer-1'); ?></div>
            <div class="footer-col"><?php dynamic_sidebar('footer-2'); ?></div>
            <div class="footer-col"><?php dynamic_sidebar('footer-3'); ?></div>
        </div>

		<div class="site-info">
            <?php if (get_theme_mod('obsidian_show_social', true)) : ?>
            <div class="social-links">
                <?php if ($github = get_theme_mod('obsidian_github_url')) : ?>
                    <a href="<?php echo esc_url($github); ?>" aria-label="GitHub"><svg>...</svg></a>
                <?php endif; ?>
                <?php if ($linkedin = get_theme_mod('obsidian_linkedin_url')) : ?>
                    <a href="<?php echo esc_url($linkedin); ?>" aria-label="LinkedIn"><svg>...</svg></a>
                <?php endif; ?>
            </div>
            <?php endif; ?>
			
            <div class="copyright">
                &copy; <?php echo date('Y'); ?> <?php echo esc_html(get_theme_mod('obsidian_copyright', get_bloginfo('name'))); ?>. 
                <span class="credit">Built with Obsidian Theme</span>
            </div>
		</div>
	</footer>
</div><!-- #page -->

<?php wp_footer(); ?>
</body>
</html>
`,

  'index.php': `<?php get_header(); ?>

<main id="primary" class="site-main">
    <div class="container layout-<?php echo esc_attr(get_theme_mod('obsidian_blog_layout', 'grid')); ?>">
    <?php if ( have_posts() ) : ?>
        <header class="page-header">
            <h1 class="page-title"><?php single_post_title(); ?></h1>
        </header>
        <div class="post-loop">
            <?php
            while ( have_posts() ) :
                the_post();
                get_template_part( 'template-parts/card' );
            endwhile;
            the_posts_navigation();
            ?>
        </div>
    <?php else :
        get_template_part( 'template-parts/content', 'none' );
    endif; ?>
    </div>
    
    <?php if(get_theme_mod('obsidian_show_sidebar_posts', true)) get_sidebar(); ?>
</main>

<?php get_footer(); ?>
`,
  'front-page.php': `<?php get_header(); ?>
<main id="primary" class="site-main">
    <?php get_template_part('template-parts/hero'); ?>
    
    <section class="featured-projects animate-on-scroll">
        <div class="container">
            <h2 class="section-title">Selected Works</h2>
            <div class="grid-3-col">
                <?php
                $projects = new WP_Query(array('post_type' => 'post', 'tag' => 'featured', 'posts_per_page' => 3));
                while($projects->have_posts()) : $projects->the_post();
                    get_template_part('template-parts/card');
                endwhile; wp_reset_postdata();
                ?>
            </div>
        </div>
    </section>

    <section class="stats-section bg-secondary animate-on-scroll">
        <div class="container grid-4-col">
            <div class="stat-item"><h3>10+</h3><p>Years Experience</p></div>
            <div class="stat-item"><h3>200+</h3><p>Projects Delivered</p></div>
            <div class="stat-item"><h3>15</h3><p>Design Awards</p></div>
            <div class="stat-item"><h3>99%</h3><p>Happy Clients</p></div>
        </div>
    </section>

    <section class="cta-section animate-on-scroll">
        <div class="container text-center">
            <h2>Let's work together</h2>
            <p>Ready to start your next big project?</p>
            <a href="mailto:<?php echo esc_attr(get_theme_mod('obsidian_email_address', 'hello@example.com')); ?>" class="button primary large">Get in Touch</a>
        </div>
    </section>
</main>
<?php get_footer(); ?>
`,

  'sidebar.php': `<?php
if ( ! is_active_sidebar( 'sidebar-1' ) ) {
	return;
}
?>
<aside id="secondary" class="widget-area">
	<?php dynamic_sidebar( 'sidebar-1' ); ?>
</aside>
`,

  'single.php': `<?php get_header(); ?>
<main id="primary" class="site-main container">
    <div class="content-area">
		<?php
		while ( have_posts() ) :
			the_post();
			get_template_part( 'template-parts/content', get_post_type() );
            // If comments are open or we have at least one comment, load up the comment template.
			if ( comments_open() || get_comments_number() ) :
				comments_template();
			endif;
		endwhile; // End of the loop.
		?>
    </div>
    <?php if(get_theme_mod('obsidian_show_sidebar_posts', true)) get_sidebar(); ?>
</main>
<?php get_footer(); ?>
`,
  'inc/customizer.php': `<?php
function obsidian_customize_register( $wp_customize ) {
    // Panel
    $wp_customize->add_panel( 'obsidian_settings', array(
        'title'    => __( 'Obsidian Theme Settings', 'obsidian' ),
        'priority' => 10,
    ) );

    // Hero Section
    $wp_customize->add_section( 'obsidian_hero_section', array(
        'title' => __( 'Hero Section', 'obsidian' ),
        'panel' => 'obsidian_settings',
    ) );
    $wp_customize->add_setting( 'obsidian_hero_title', array( 'default' => 'We Build Digital Experiences', 'sanitize_callback' => 'sanitize_text_field' ) );
    $wp_customize->add_control( 'obsidian_hero_title', array( 'label' => 'Hero Title', 'section' => 'obsidian_hero_section', 'type' => 'text' ) );
    
    // Expand colors
    $wp_customize->add_setting('obsidian_accent_color', array('default' => '#c9a44a', 'sanitize_callback' => 'sanitize_hex_color'));
    $wp_customize->add_control(new WP_Customize_Color_Control($wp_customize, 'obsidian_accent_color', array('label' => 'Accent Color', 'section' => 'colors')));

    // Output CSS variables
    add_action('wp_head', function() {
        $accent = get_theme_mod('obsidian_accent_color', '#c9a44a');
        echo "<style>:root { --obs-accent-primary: {$accent}; }</style>";
    });
}
add_action( 'customize_register', 'obsidian_customize_register' );
`,
};
