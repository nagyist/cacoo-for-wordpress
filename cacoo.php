<?php
/*
Plugin Name: Cacoo for WordPress
Plugin URI: http://cacoo.com/
Description: The Cacoo plugin for WordPress allows you to create diagrams and insert them into your posts.
Author: Nulab Inc.
Version: 0.5
Author URI: http://cacoo.com/
*/
class Cacoo { 
    function Cacoo() {
        add_action('plugins_loaded', array(&$this, 'Initalization'));
		// Register shortcodes
		add_shortcode('cacoo', array(&$this, 'shortcode_cacoo') );
		if ( is_admin() ) {
			// Editor pages only
			if ( in_array( basename($_SERVER['PHP_SELF']), apply_filters( 'vvq_editor_pages', array('post-new.php', 'page-new.php', 'post.php', 'page.php') ) ) ) {
				wp_enqueue_script( 'jquery-ui-dialog' );
				wp_enqueue_style( 'cacoo-jquery-ui', plugins_url('/cacoo-for-wordpress/resources/cacoo-jquery-ui.css'), array(), $this->version, 'screen' );
			}
		}
    }
    function sink_hooks(){
        add_filter('mce_plugins', array(&$this, 'mce_plugins'));
    }
    function Initalization() {
        add_action('init', array(&$this, 'addbuttons'));
    }
    function addbuttons() {
        // auth
       if ( ! current_user_can('edit_posts') && ! current_user_can('edit_pages') )
         return;
    
       // supported rich editor only 
       if ( get_user_option('rich_editing') == 'true') {
         add_filter("mce_external_plugins", array(&$this, 'mce_external_plugins'));
         add_filter('mce_buttons', array(&$this, 'mce_buttons'));
       }
    }
    function mce_buttons($buttons) {
       // add button name
       array_push($buttons, "separator", "Cacoo");
       return $buttons;
    }
    // load TinyMCE plugin file :  editor_plugin.js (wp2.5)
    function mce_external_plugins($plugin_array) {
       //plugin function name
       $plugin_array['Cacoo'] = plugins_url('/cacoo-for-wordpress/resources/tinymce3/editor_plugin.js');
       return $plugin_array;
    }
	// Handle Cacoo shortcodes
	function shortcode_cacoo( $atts, $content = '' ) {
      $width = $atts['width'] == null ? '410' : $atts['width'];
      $height = $atts['height'] == null ? '330' : $atts['height'];
      $ifwidth = $width + 20;
      $ifheight = $height + 30;
      $theme = $atts['theme'] == null ? 'cacoo' : $atts['theme'];
      return
        '<iframe src="' . $content . '/view?w=' . $width . '&h=' . $height . '&tm=' . $theme . '" width="'. $ifwidth . '" height="' . $ifheight . '" style="border:0px solid #fff">' .
        '</iframe>'
        ;
	}
}
$cacoo = new Cacoo();
add_action('init',array(&$cacoo, 'Cacoo'));
?>
