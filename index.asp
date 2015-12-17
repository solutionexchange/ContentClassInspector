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
	<link type="text/css" rel="stylesheet" href="css/shCoreDefault.css"/>
	<link rel="stylesheet" href="css/custom.css" />
	<script type="text/javascript" src="js/jquery-1.10.2.min.js"></script>
	<script type="text/javascript" src="js/bootstrap.min.js"></script>
	<script type="text/javascript" src="js/handlebars-v2.0.0.js"></script>
	<script type="text/javascript" src="js/content-class-inspector.js"></script>
	<script type="text/javascript" src="rqlconnector/Rqlconnector.js"></script>
	<script type="text/javascript" src="js/shCore.js"></script>
	<script type="text/javascript" src="js/shBrushXml.js"></script>
	
	<script id="template-dialog" type="text/x-handlebars-template" data-container="#action-dialog" data-action="replace">
		<div class="modal hide fade {{class}}" tabindex="-1" role="dialog" aria-hidden="true">
			<div class="modal-header">
				<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
				<h3>{{name}}</h3>
			</div>
			<div class="modal-body">
				<div class="alert">Loading...</div>
			</div>
		</div>
	</script>
	
	<script id="template-dialog-template-variant-code" type="text/x-handlebars-template" data-container="#action-dialog .modal-body" data-action="replace">
		<pre class="brush: html;">{{templatevariantcode}}</pre>
	</script>
	
	<script id="template-dialog-template-variant-element-usage" type="text/x-handlebars-template" data-container="#action-dialog .modal-body" data-action="replace">
		<table class="table">
			<thead>
				<tr>
					<th>All Elements</th>
					<th>Order of Elements in Code</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>
						<div class="alert">
							{{#each contentclasselements}}
							<div>{{name}}</div>
							{{/each}}
						</div>
					</td>
					<td>
						<div class="alert alert-success">
							{{#each templateelements}}
							<div>{{name}}</div>
							{{/each}}
						</div>
					</td>
				</tr>
			</tbody>
		</table>
	</script>
	
	<script id="template-content-class-folders" type="text/x-handlebars-template" data-container="#content-classes" data-action="replace">
		<div class="accordion">
			{{#each contentclassfolders}}
			<div class="accordion-group {{guid}}">
				<div class="accordion-heading">
					<a class="accordion-toggle" data-toggle="collapse" href="#{{guid}}"><strong>{{name}}</strong></a>
				</div>
				<div id="{{guid}}" class="accordion-body collapse in">
					<div class="accordion-inner">
						<div class="alert">Loading...</div>
					</div>
				</div>
			</div>
			{{/each}}
		</div>
	</script>
	
	<script id="template-content-classes-count" type="text/x-handlebars-template" data-container=".accordion-heading .accordion-toggle" data-action="append">
		&nbsp;<span class="badge badge-info">{{count}}</span>
	</script>
	
	<script id="template-content-classes" type="text/x-handlebars-template" data-container=".accordion-body .accordion-inner" data-action="replace">
		{{#each contentclasses}}
		<div class="alert alert-info {{guid}}" data-guid="{{guid}}">
			<div>
				<div class="btn btn-link btn-copy" data-path="{{path}}"><strong>{{name}}</strong></div>
			</div>
			<div class="templates">
			</div>
		</div>
		{{/each}}
	</script>
	
	<script id="template-content-class-templates" type="text/x-handlebars-template" data-container=".templates" data-action="replace">
		{{#each contentclasstemplates}}
		<div class="{{guid}}">
			<div class="btn btn-small btn-element-usage" data-guid="{{guid}}" data-path="{{path}}"><i class="icon-th"></i></div>
			<div class="btn btn-link btn-template-variant-code" data-guid="{{guid}}" data-path="{{path}}">{{name}}</div>
			{{#each projectvariantnames}}
			<span class="label">{{name}}</span>
			{{/each}}
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