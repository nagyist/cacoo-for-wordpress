<?php
/*
Plugin Name: Cacoo for WordPress
Plugin URI: http://cacoo.com/
Description: The Cacoo plugin for WordPress allows you to create diagrams and insert them into your posts.
Author: Nulab Inc.
Version: 0.8
Author URI: http://cacoo.com/
*/
class Cacoo
{
    function getVersion()
    {
        return '0.8';
    }

    function Cacoo()
    {
        load_plugin_textdomain('cacoo', false, 'cacoo-for-wordpress/languages');
        add_action('plugins_loaded', array(&$this, 'Initalization'));
        // Register shortcodes
        add_shortcode('cacoo', array(&$this, 'shortcode_cacoo'));
        if (is_admin()) {
            // Editor pages only
            if (in_array(basename($_SERVER['PHP_SELF']), apply_filters('vvq_editor_pages', array('post-new.php', 'page-new.php', 'post.php', 'page.php')))) {
                wp_enqueue_script('jquery-ui-dialog');
                wp_enqueue_style('cacoo-jquery-ui', plugins_url('/cacoo-for-wordpress/resources/cacoo-jquery-ui.css'), array(), $this->getVersion(), 'screen');
                add_action('edit_form_advanced', array(&$this, 'add_edit_page_content'));
                add_action('edit_page_form', array(&$this, 'add_edit_page_content'));
                wp_register_script('cacoo-sdk', plugins_url('/cacoo-for-wordpress/resources/cacoo.js'));
                wp_enqueue_script('cacoo-sdk');
                wp_localize_script('cacoo-sdk', 'CACOO_RES', array(
                    'info' => __('Please enter the URL at which the diagram can be viewed.', 'cacoo'),
                    'example' => __('Example', 'cacoo'),
                    'filter' => __('Filter', 'cacoo'),
                    'folder' => __('Folder', 'cacoo'),
                    'viewer' => __('Viewer', 'cacoo'),
                    'image' => __('Image', 'cacoo'),
                    'size' => __('Size', 'cacoo'),
                    'pixels' => __('pixels', 'cacoo'),
                    'theme' => __('Theme', 'cacoo'),
                    'toolbar' => __('Toolbar', 'cacoo'),
                    'always_show' => __('Always show', 'cacoo'),
                    'show_with_mouseover' => __('Show with mouseover', 'cacoo'),
                    'preview' => __('Preview', 'cacoo'),
                    'button_next' => __('Next', 'cacoo'),
                    'button_cancel' => __('Cancel', 'cacoo'),
                    'button_back' => __('Back', 'cacoo'),
                    'button_insert' => __('Insert', 'cacoo'),
                    'choice' => __('Choice', 'cacoo'),
                    'custom' => __('Custom', 'cacoo'),
                    'confirm_retry_login' => __('Failed to access your Cacoo information.  Delete the existing authenticated information and try again?', 'cacoo'),
                    'info_private_diagram_warning' => __('This diagram is set to private.  To publish to external users, please change the setting to "Open diagram to public by URL" on the Save panel.', 'cacoo'),
                ));
            }
        }
        // Build admin menu
        add_action('admin_menu', array(&$this, 'buildAdminMenu'), 1);
    }

    function sink_hooks()
    {
        add_filter('mce_plugins', array(&$this, 'mce_plugins'));
    }

    function Initalization()
    {
        add_action('init', array(&$this, 'addbuttons'));
    }

    function addbuttons()
    {
        // auth
        if (!current_user_can('edit_posts') && !current_user_can('edit_pages'))
            return;

        // supported rich editor only
        if (get_user_option('rich_editing') == 'true') {
            add_filter("mce_external_plugins", array(&$this, 'mce_external_plugins'));
            add_filter('mce_buttons', array(&$this, 'mce_buttons'));
        }
    }

    function mce_buttons($buttons)
    {
        // add button name
        array_push($buttons, "separator", "Cacoo");
        return $buttons;
    }

    // load TinyMCE plugin file :  editor_plugin.js (wp2.5)
    function mce_external_plugins($plugin_array)
    {
        //plugin function name
        $plugin_array['Cacoo'] = plugins_url('/cacoo-for-wordpress/resources/tinymce3/editor_plugin.js');
        return $plugin_array;
    }

    // Handle Cacoo shortcodes
    function shortcode_cacoo($atts, $content = '')
    {
        $width = $atts['width'] == null ? '410' : $atts['width'];
        $height = $atts['height'] == null ? '330' : $atts['height'];
        $ifwidth = $width + 20;
        $ifheight = $height + 30;
        $theme = $atts['theme'] == null ? 'cacoo' : $atts['theme'];
        $toolbar = $atts['toolbar'] != 'no' ? 'yes' : 'no';
        return
            '<iframe src="' . $content . '/view?w=' . $width . '&h=' . $height . '&tm=' . $theme . '&tb=' . $toolbar . '" width="' . $ifwidth . '" height="' . $ifheight . '" style="border:0px solid #fff">' .
            '</iframe>';
    }

    function build_url()
    {
        if (isset($_SERVER['HTTPS']) and $_SERVER['HTTPS'] == 'on') {
            $protocol = 'https://';
        } else {
            $protocol = 'http://';
        }
        return $protocol . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
    }

    function add_edit_page_content()
    {
        $callback_url = plugins_url('cacoo-for-wordpress/callback.php', dirname(__FILE__));
        $update_token_url = plugins_url('cacoo-for-wordpress/update_token.php', dirname(__FILE__));
        $current_user = wp_get_current_user();
        $oauth_token = get_user_meta($current_user->ID, 'cacoo_oauth_token', true);
        $token_secret = get_user_meta($current_user->ID, 'cacoo_token_secret', true);
        $account_nickname = get_user_meta($current_user->ID, 'cacoo_account_nickname', true);
        $account_image_url = get_user_meta($current_user->ID, 'cacoo_account_image_url', true);

        echo'
<script type="text/javascript">
jQuery(function($) {

CACOO.init({
  consumerKey      : "CjLoToPHFgZKAltaGyixPy",
  consumerSecret   : "wfFUkzhuzYKJSztlrvutZVoGTtnIhIgFbqQVIsYSrA",
  callback: "' . $callback_url . '",
  oauthToken: "' . $oauth_token . '",
  tokenSecret: "' . $token_secret . '"
});

}, jQuery);
</script>
';
    }

    function buildAdminMenu()
    {
        // Add page to the admin options
        add_options_page('Cacoo for Wordpress', 'Cacoo', 'manage_options', 'cacoo', array(&$this, 'pageSettings'));
    }

    function pageSettings()
    {
        if ($_GET['cmd'] === 'update') {
            $this->update_token_for_api();
        } elseif ($_GET['cmd'] === 'remove') {
            $this->remove_token_for_api();
        } else {
            $this->build_settings_page();
        }
    }

    function update_token_for_api() {
        $current_user = wp_get_current_user();
        update_user_meta($current_user->ID, 'cacoo_oauth_token', $_GET['oauth_token']);
        update_user_meta($current_user->ID, 'cacoo_token_secret', $_GET['token_secret']);
        update_user_meta($current_user->ID, 'cacoo_account_nickname', $_GET['nickname']);
        update_user_meta($current_user->ID, 'cacoo_account_image_url', $_GET['image_url']);
    }

    function remove_token_for_api() {
        $current_user = wp_get_current_user();
        delete_user_meta($current_user->ID, 'cacoo_oauth_token');
        delete_user_meta($current_user->ID, 'cacoo_token_secret');
        delete_user_meta($current_user->ID, 'cacoo_account_nickname');
        delete_user_meta($current_user->ID, 'cacoo_account_image_url');
    }

    function build_settings_page() {
        $current_user = wp_get_current_user();
        $oauth_token = get_user_meta($current_user->ID, 'cacoo_oauth_token', true);
        $token_secret = get_user_meta($current_user->ID, 'cacoo_token_secret', true);
        $nickname = get_user_meta($current_user->ID, 'cacoo_account_nickname', true);
        $image_url = get_user_meta($current_user->ID, 'cacoo_account_image_url', true);

        $callback_url = plugins_url('cacoo-for-wordpress/callback.php', dirname(__FILE__));
        $update_token_url = $this->build_url() . '&cmd=update';
        $remove_token_url = $this->build_url() . '&cmd=remove';
        // Display settings form
        echo '<div class="wrap">
        <div id="icon-options-general" class="icon32"><br></div>
        <h2>' . __('Cacoo for WordPress Settings', 'cacoo') . '</h2></div>

        <h3>' . __('What is Cacoo for WordPress?', 'cacoo') . '</h3>

        <p>' . __('<a href="http://cacoo.com/" target="_blank">Cacoo</a> is an online drawing tool.  Inserting Cacoo diagrams to the WordPress post becomes much easier by using Cacoo for WordPress.', 'cacoo') . '</p>
        <p>&nbsp;</p>
        <h3>' . __('Cacoo authentication(oAuth)', 'cacoo') . '</h3>';
        if (isset($oauth_token, $token_secret) && $oauth_token != '' && $token_secret != '') {
            echo '
        				<p>' . __('You have been authenticated with your Cacoo account.', 'cacoo') . '<b><img src="' . $image_url . '" />[' . $nickname . ']</b></p>
        				<p><a href="javascript:remove_token();" />' . __('Delete your Cacoo authentication', 'cacoo') . ' [' . $nickname . ']</a></p>';
            echo'
      <script type="text/javascript">
      function remove_token() {
        if(confirm("' . __('Delete Cacoo authentication?', 'cacoo') . '")==true){
          jQuery.get("options-general.php?page=cacoo&cmd=remove", {}, function() {
            document.location.href="options-general.php?page=cacoo";
          });
        }
      }
      </script>
      ';

        } else {
            echo '
        				<p><b>' . __('No Cacoo authentication has been set.', 'cacoo') . '</b></p>
        				<p>' . __('Press the button below to authenticate with Cacoo.', 'cacoo') . '</p>
        				<p><input type="submit" class="button-primary" name="twitterOAuth" value="' . __('Authenticate with Cacoo', 'cacoo') . '" onclick="authenticate()" /></p>';
            echo ' <script src="' . plugins_url('/cacoo-for-wordpress/resources/cacoo.js') . '" type="text/javascript"></script>';
            echo'
      <script type="text/javascript">
      CACOO.init({
        consumerKey      : "CjLoToPHFgZKAltaGyixPy",
        consumerSecret   : "wfFUkzhuzYKJSztlrvutZVoGTtnIhIgFbqQVIsYSrA",
        callback: "' . $callback_url . '"
      });
      function authenticate() {
          CACOO.login(function(oauth) {
              CACOO.get("/account.json", {}, function(account) {
                  var params = {
                    oauth_token: oauth.oauthToken,
                    token_secret: oauth.tokenSecret,
                    nickname: account.nickname,
                    image_url: account.imageUrl
                  };
                  jQuery.get("options-general.php?page=cacoo&cmd=update", params, function() {
                    document.location.href="options-general.php?page=cacoo";
                  });
              });
          });
      }
      </script>
      ';
        }
    }
}

function debug_log($message)
{
    echo $message . "\n";
}

$cacoo = new Cacoo();
add_action('init', array(&$cacoo, 'Cacoo'));
?>
