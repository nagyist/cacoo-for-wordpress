<?php
echo '<html>
<body>
<script type="text/javascript" src="resources/cacoo.js"></script>
<script type="text/javascript">
   window.opener.CACOO.authorize(window.location.search.substring(1));
   window.close();
</script>
</body>
</html>';
?>
