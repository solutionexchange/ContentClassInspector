<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="expires" content="-1"/>
	<meta http-equiv="pragma" content="no-cache">
	<meta http-equiv="cache-control" content="no-cache">
	<meta http-equiv="content-type" content="text/html; charset=utf-8"/>
	<meta name="copyright" content="2014, Web Solutions"/>
	<meta http-equiv="X-UA-Compatible" content="IE=edge" >
	<title>Content Class Inspector</title>
	<link rel="stylesheet" href="css/bootstrap.min.css" />
	<script type="text/javascript" src="js/jquery-1.10.2.min.js"></script>
	<script type="text/javascript" src="js/bootstrap.min.js"></script>
	<script type="text/javascript" src="js/handlebars-v2.0.0.js"></script>
	<script type="text/javascript" src="js/content-class-inspector.js"></script>
	<script type="text/javascript" src="rqlconnector/Rqlconnector.js"></script>

	<script id="template-content-class-folders" type="text/x-handlebars-template" data-container="#content-classes" data-action="replace">
		<div class="accordion">
			{{#each contentclassfolders}}
			<div class="accordion-group">
				<div class="accordion-heading">
					<span class="badge">{{count}}</span><a class="accordion-toggle" data-toggle="collapse" href="#{{guid}}">{{name}}</a>
				</div>
				<div id="{{guid}}" class="accordion-body collapse in">
					<div class="alert">Loading...</div>
				</div>
			</div>
			{{/each}}
		</div>
	</script>
	
	<script id="template-content-classes" type="text/x-handlebars-template" data-container="#content-classes" data-action="replace">
		{{#each contentclasses}}
		<div class="alert alert-info {{guid}}">
			<div>
				<div class="btn"><i class="icon-search"></i></div> {{name}}
			</div>
			<div class="templates">

			</div>
		</div>
		{{/each}}
	</script>
	
	<script id="template-content-class-templates" type="text/x-handlebars-template" data-container="#content-classes" data-action="replace">
		{{#each contentclasstemplates}}
		<div>
			<div class="btn"><i class="icon-th"></i></div>
			<div class="btn btn-link" data-guid="{{guid}}">{{name}}</div>
			<span class="label">{{projectvariantname}}</span>
		</div>
		{{/each}}
	</script>
	
	<script type="text/javascript">
		var LoginGuid = '<%= session("loginguid") %>';
		var SessionKey = '<%= session("sessionkey") %>';
		var ContentClassGuid = '<%= session("treeguid") %>';

		$(document).ready(function() {
			var RqlConnectorObj = new RqlConnector(LoginGuid, SessionKey);
			var ContentClassInspectorObj = new ContentClassInspector(RqlConnectorObj, ContentClassGuid);
		});
	</script>
</head>
<body>
	<div id="action-dialog"></div>
	<div class="container" id="content-classes">
		<div class="alert">Loading</div>
	</div>
</body>
</html>