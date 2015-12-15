<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
   "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<head>
	<meta http-equiv="expires" content="-1"/>
	<meta http-equiv="content-type" content="text/html; charset=utf-8"/>
	<meta name="copyright" content="2010, Web Solutions Group"/>
	<title>Element Usage</title>
	<style type="text/css">
		.fullcontent
		{
			padding: 0px 7px 7px 7px;
		}
				
		.headline
		{
			padding: 5px 0px 5px 0px;
			font-weight: bold;
		}
		
		.content
		{
			padding: 5px 5px 5px 5px;
			background-color: #FFFFFF;
		}

		#code
		{
			background-color:#FFFFCC;
			float: left;
		}
		
		#all
		{
			background-color:#E5EECC;
			float: right;
		}
		
		.positivebutton
		{
			background-color:#F5F5F5;
			border: 1px solid #DEDEDE;
			color: #529214;
			padding: 5px 10px 5px 10px;
			font-weight: bold;
			cursor: pointer;
			cursor: hand;
			float:right;
			margin-left: 10px;
		}
		
		.clear
		{
			clear: both;
		}
		
		#temparea
		{
			display:none;
		}
	</style>
	<script type="text/javascript" src="js/jquery-1.5.min.js"></script>
	<script type="text/javascript">
		$(document).ready(function() { 
			ListAllElments(getUrlVars()["contentclassguid"]);
			ListTemplateElements(getUrlVars()["templateguid"]);
		});
		
		function getUrlVars()
		{
			var vars = [], hash;
			var hashes = window.location.href.slice(window.location.href.indexOf("?") + 1).split("&");
			for(var i = 0; i < hashes.length; i++)
			{
				hash = hashes[i].split("=");
				vars.push(hash[0]);
				vars[hash[0]] = hash[1];
			}
			return vars;
		}
		
		function ListAllElments(ContentClassGuid)
		{
			var RQL = padRQLXML("<PROJECT><TEMPLATE action=\"load\" guid=\"" + ContentClassGuid + "\"><ELEMENTS childnodesasattributes=\"0\" action=\"load\"/></TEMPLATE></PROJECT>");
			
			// send RQL XML
			$.post("rqlaction.asp", { rqlxml: RQL },
				function(data){
					$("#all .content").empty();
				
					$(data).find("ELEMENT").each(function(){
						var ElementHTML = "<div value=\"" + $(this).attr("guid") + "\">" + $(this).attr("eltname") + "</div>";
						
						$("#all .content").append(ElementHTML);
					});
			}, "xml");
		}
		
		function ListTemplateElements(TemplateGuid)
		{
			var RQL = padRQLXML("<PROJECT><TEMPLATE><TEMPLATEVARIANT readonly=\"1\" action=\"load\" guid=\"" + TemplateGuid + "\"></TEMPLATEVARIANT></TEMPLATE></PROJECT>");
			
			// send RQL XML
			$.post("rqlaction.asp", { rqlxml: RQL },
				function(data){
					$("#code .content").empty();
				
					var TemplateCode = $(data).text();
					
					// search for placeholders
					var PlaceholderRegexp = new RegExp("[<]%([_\-a-zA-Z0-9]+?)%[>]", "gi");
					var Result;

					while(Result = PlaceholderRegexp.exec(TemplateCode))
					{
						var PlaceholderName = Result[1];
						
						if($("#code .content div:contains('" + PlaceholderName + "')").length == 0)
						{
							var ElementHTML = "<div>" + PlaceholderName + "</div>";
							
							$("#code .content").append(ElementHTML);
						}
					}
			}, "xml");
		}
		
		function Reorder()
		{
			// move all elements to temparea
			$("#temparea").append($("#all .content div"));
				
			$("#code .content div").each(function(){
				var ElementName = $(this).text();

				var MatchedElement = $("#temparea div:contains('" + ElementName + "')");
				
				if(MatchedElement.length != 0)
				{
					$("#all .content").append(MatchedElement);
				}
			});
			
			// attach back left over
			$("#all .content").append($("#temparea div"));
		}
		
		function padRQLXML(innerRQLXML)
		{
			return "<IODATA loginguid=\"<%= session("loginguid") %>\" sessionkey=\"<%= session("sessionkey") %>\">" + innerRQLXML + "</IODATA>";
		}
	</script>
</head>
<body>
	<table style="width: 100%;">
		<tr>
			<td style="vertical-align:top;">
				<div class="fullcontent" id="all">
					<div class="headline">All Elements</div>
					<div class="content">
						<center>loading...</center>
					</div>
					<div id="temparea">
					</div>
				</div>
			</td>
			<td style="vertical-align:top;">
				<div class="fullcontent" id="code">
					<div class="headline">Order of Elements in Code</div>
					<div class="content">
						<center>loading...</center>
					</div>
				</div>
			</td>
		</tr>
	</table>
	<div class="clear">&nbsp;</div>
	<div id="controls">
		<div class="positivebutton" id="reorder" onclick="Reorder();">Reorder</div>
	</div>
</body>
</html>