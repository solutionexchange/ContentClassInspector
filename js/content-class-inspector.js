function ContentClassInspector(RqlConnectorObj, ContentClassGuid) {
	var ThisClass = this;
	this.RqlConnectorObj = RqlConnectorObj;
	
	this.TemplateDialog = '#template-dialog';
	this.TemplateDialogTemplateVariantCode = '#template-dialog-template-variant-code';
	this.TemplateContentClassFolders = '#template-content-class-folders';
	this.TemplateContentClasses = '#template-content-classes';
	this.TemplateContentClassTemplates = '#template-content-class-templates';
	
	this.ListAllProjectVariants(function(Data){
		var ProjectVariantGuids = Data;
		
		ThisClass.ListAllContentClassFolders(function(Data){
			var ContentClassFolders = Data;
			
			$.each(ContentClassFolders, function(){
				var ContentClassFolderGuid = this.guid;
				var ContentClassFolderName = this.name;
				
				ThisClass.ListContentClasses(ContentClassFolderGuid, ContentClassFolderName, function(Data){
					var ContentClasses = Data;

					$.each(ContentClasses, function(){
						var ContentClassGuid = this.guid;

						ThisClass.ListContentClassTemplates(ContentClassGuid, ProjectVariantGuids);
					});
				});
			});
		});
	});
	
	$('body').on('click', '.btn-copy', function(){
		ThisClass.CopyToClipboard($(this).attr('data-path'));
	});
	
	var ActionDialogContainer = $(ThisClass.TemplateDialog).attr('data-container');
	
	$(ActionDialogContainer).find('.modal').on('click', 'shown', function(){
		
	});
	
	$(ActionDialogContainer).find('.modal').on('click', 'shown', function(){
		
	});
	
	$('body').on('click', '.btn-template-variant-code', function(){
		$(this).closest('.content-class').removeClass('alert-info').addClass('alert-success');
		
		ThisClass.UpdateArea(ThisClass.TemplateDialog, undefined, {'name': 'Template Code', 'class': 'template-variant-code'});
		
		$ActionDialogModal = $(ActionDialogContainer).find('.modal');	
		$ActionDialogModal.modal('show');
		
		var ContentClassTemplateVariantGuid = $(this).attr('data-guid');
		ThisClass.ListContentClassTemplateVariantCode(ContentClassTemplateVariantGuid);
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
				'name': $(this).attr('name'),
				'guid': $(this).attr('guid')
			};
			
			ContentClassFolders.push(ContentClassFolder);
		});
		
		var ContentClassFoldersJson = {
			'contentclassfolders': ContentClassFolders
		};
		
		ThisClass.UpdateArea(ThisClass.TemplateContentClassFolders, undefined, ContentClassFoldersJson);
		
		if(CallbackFunc){
			CallbackFunc(ContentClassFolders);
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
				'guid': $(this).attr('guid'),
				'path': ContentClassFolderName + '/' + $(this).attr('name')
			};
			
			ContentClasses.push(ContentClass);
		});

		var ContentClassesJson = {
			'contentclasses': ContentClasses
		};

		ThisClass.UpdateArea(ThisClass.TemplateContentClasses, ' .' + ContentClassFolderGuid, ContentClassesJson);
		
		if(CallbackFunc){
			CallbackFunc(ContentClasses);
		}
	});
}

ContentClassInspector.prototype.ListContentClassTemplates = function(ContentClassGuid, ProjectVariantGuids, CallbackFunc) {
	var ThisClass = this;
	
	// list templates in a content class
	var RqlXml = '<PROJECT><TEMPLATE guid="' + ContentClassGuid + '"><TEMPLATEVARIANTS action="list"/><TEMPLATEVARIANTS action="projectvariantslist" /></TEMPLATE></PROJECT>';

	// send RQL XML
	this.RqlConnectorObj.SendRql(RqlXml, false, function(Data) {
		var ContentClassTemplates = [];

		$(Data).find('TEMPLATEVARIANTS[action="list"] TEMPLATEVARIANT').each(function() {
			var ContentClassTemplate = {
				'name': $(this).attr('name'),
				'guid': $(this).attr('guid'),
				'projectvariantnames': [] 
			};
			
			$(Data).find('TEMPLATEVARIANTS[action="projectvariantslist"] TEMPLATEVARIANT[guid="' + ContentClassTemplate.guid + '"]').each(function() {
				var ProjectVariantName = {
					'name': ProjectVariantGuids[$(this).attr('projectvariantguid')]
				};
				
				ContentClassTemplate.projectvariantnames.push(ProjectVariantName);
			});
			
			ContentClassTemplates.push(ContentClassTemplate);
		});

		var ContentClassTemplatesJson = {
			'contentclasstemplates': ContentClassTemplates
		};

		ThisClass.UpdateArea(ThisClass.TemplateContentClassTemplates, ' .' + ContentClassGuid, ContentClassTemplatesJson);

		if(CallbackFunc){
			CallbackFunc(ProjectVariantGuids);
		}
	});
}

ContentClassInspector.prototype.ListContentClassTemplateVariantCode = function(ContentClassTemplateVariantGuid, CallbackFunc) {
	var ThisClass = this;
	
	// list templates in a content class
	var RqlXml = '<PROJECT><TEMPLATE><TEMPLATEVARIANT action="load" readonly="1" guid="' + ContentClassTemplateVariantGuid + '" /></TEMPLATE></PROJECT>';
	
	// send RQL XML
	this.RqlConnectorObj.SendRql(RqlXml, false, function(Data) {
		var TemplateVariantCode = $.trim($(Data).find('TEMPLATEVARIANT').text());
		
		ThisClass.UpdateArea(ThisClass.TemplateDialogTemplateVariantCode, undefined, {'templatevariantcode': TemplateVariantCode});
		
		if(CallbackFunc){
			CallbackFunc(Data);
		}
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