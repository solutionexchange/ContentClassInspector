function ContentClassInspector(RqlConnectorObj, ContentClassGuid) {
	var ThisClass = this;
	this.RqlConnectorObj = RqlConnectorObj;
	
	this.TemplateContentClassFolders = '#template-content-class-folders';
	this.TemplateContentClasses = '#template-content-classes';
	this.TemplateContentClassTemplates = '#template-content-class-templates';
	
	this.ListAllProjectVariants(function(Data){
		ThisClass.ListAllContentClassFolders()
	});
}

ContentClassInspector.prototype.ListAllProjectVariants = function(CallbackFunc) {
	// list all project variants
	var RqlXml = '<PROJECT><PROJECTVARIANTS action="list" /></PROJECT>';

	// send RQL XML
	this.RqlConnectorObj.SendRql(RqlXml, false, function(Data) {
		var ProjectVariantGuids = [];
		
		$(Data).find('PROJECTVARIANT').each(function() {
			ProjectVariantGuids[$(this).attr('guid')] = $(this).attr('name');
		});
		
		if(CallbackFunc){
			CallbackFunc(ProjectVariantGuids);
		}
	});
}

ContentClassInspector.prototype.ListAllContentClassFolders = function(CallbackFunc) {
	var ThisClass = this;
	
	// list content class folders
	var RqlXml = '<TEMPLATEGROUPS action="load" />';

	this.RqlConnectorObj.SendRql(RqlXml, false, function(Data) {
		var ContentClassFolders = [];
		
		$(Data).find('GROUP').each(function() {
			var ContentClassFolder = {
				'headline': $(this).attr('name'),
				'guid': $(this).attr('guid')
			}
			;
			ContentClassFolders.push(ContentClassFolder);
		});
		
		var ContentClassFoldersJson = {
			'contentclassfolders': ContentClassFolders,
			'count': ContentClassFolders.length
		};
		
		ThisClass.UpdateArea(ThisClass.TemplateContentClassFolders, undefined, ContentClassFoldersJson);
		
		if(CallbackFunc){
			CallbackFunc(ProjectVariantGuids);
		}
	});
}

ContentClassInspector.prototype.ListContentClasses = function(ContentClassFolderGuid, ContentClassFolderName, CallbackFunc) {
	var ThisClass = this;
	
	// list content classes in a folder
	var RqlXml = '<TEMPLATES folderguid="' + ContentClassFolderGuid + '" action="list"/>';

	this.RqlConnectorObj.SendRql(RqlXml, false, function(Data) {
		var ContentClasses = [];
		
		$(Data).find('TEMPLATE').each(function() {
			var ContentClass = {
				'name': $(this).attr('name'),
				'guid': $(this).attr('guid')
				'path': ContentClassFolderName + '/' + $(this).attr('name')
			};
			
			ContentClasses.push(ContentClass);
			
			ThisClass.UpdateArea(ThisClass.TemplateContentClasses, ' .' + ContentClassFolderGuid, ContentClassFoldersJson);
		});
		
		if(CallbackFunc){
			CallbackFunc(ProjectVariantGuids);
		}
	});
}

ContentClassInspector.prototype.ListContentClassTemplates = function(ContentClassGuid, ProjectVariantGuids, CallbackFunc) {
	// list templates in a content class
	var RqlXml = '<PROJECT><TEMPLATE guid="' + ContentClassGuid + '"><TEMPLATEVARIANTS action="list"/></TEMPLATE></PROJECT>';

	// send RQL XML
	this.RqlConnectorObj.SendRql(RqlXml, false, function(Data) {
		var ContentClassTemplates = [];
		
		$(data).find('TEMPLATEVARIANT').each(function() {
			var ContentClassTemplate = {
				'name': $(this).attr('name'),
				'guid': $(this).attr('guid'),
				'projectvariantname': ProjectVariantGuids[$(this).attr("projectvariantguid")] 
			};
		});
		
		ThisClass.UpdateArea(ThisClass.TemplateContentClasses, ' .' + ContentClassGuid, ContentClassFoldersJson);
		
		if(CallbackFunc){
			CallbackFunc(ProjectVariantGuids);
		}
	});
}

ContentClassInspector.prototype.ListContentClassTemplateProjectVariantAssignment = function(ContentClassGuid, CallbackFunc) {
	// list project variants assigned to template
	var strRQL = padRQLXML('<PROJECT><TEMPLATE guid="' + ContentClassGuid + '" ><TEMPLATEVARIANTS action="projectvariantslist" /></TEMPLATE></PROJECT>');

	// send RQL XML
	this.RqlConnectorObj.SendRql(RqlXml, false, function(Data) {
		$(data).find('TEMPLATEVARIANT').each(function() {
			$('#' + $(this).attr('guid') + ' span.projectvariants').append(ProjectVariantGuids[$(this).attr('projectvariantguid')] + ' ');
		});
	});
}

ContentClassInspector.prototype.CopyToClipboard = function(Text) {
	window.clipboardData.setData('Text', Text);
}

ContentClassInspector.prototype.UpdateArea = function(TemplateId, DataContainerAdditional, Data){
	var ContainerId = $(TemplateId).attr('data-container');
	if(DataContainerAdditional) {
		ContainerId += DataContainerAdditional;
	}
	var TemplateAction = $(TemplateId).attr('data-action');
	var Template = Handlebars.compile($(TemplateId).html());
	var TemplateData = Template(Data);

	if((TemplateAction == 'append') || (TemplateAction == 'replace')) {
		if (TemplateAction == 'replace') {
			$(ContainerId).empty();
		}

		$(ContainerId).append(TemplateData);
	}

	if(TemplateAction == 'prepend') {
		$(ContainerId).prepend(TemplateData);
	}

	if(TemplateAction == 'after') {
		$(ContainerId).after(TemplateData);
	}
}