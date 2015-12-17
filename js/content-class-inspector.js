function ContentClassInspector(RqlConnectorObj, ContentClassGuid) {
	var ThisClass = this;
	this.RqlConnectorObj = RqlConnectorObj;
	
	this.TemplateDialog = '#template-dialog';
	this.TemplateDialogTemplateVariantCode = '#template-dialog-template-variant-code';
	this.TemplateDialogTemplateVariantElementUsage = '#template-dialog-template-variant-element-usage';
	this.TemplateContentClassFolders = '#template-content-class-folders';
	this.TemplateContentClassesCount = '#template-content-classes-count';
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
						var Path = this.path;

						ThisClass.ListContentClassTemplates(Path, ContentClassGuid, ProjectVariantGuids);
					});
				});
			});
		});
	});
	
	$('body').on('click', '.btn-copy', function(){
		ThisClass.CopyToClipboard($(this).attr('data-path'));
	});
	
	var ActionDialogContainer = $(ThisClass.TemplateDialog).attr('data-container');
	
	$(ActionDialogContainer).on('shown', '.modal', function(){
		ThisClass.HideScrollbars();
	});
	
	$(ActionDialogContainer).on('shown', '.template-variant-code.modal', function(){
		var TotalHeight = $(this).height();
		var HeaderHeight = $(this).find('.modal-header').height();
		var ContentPadding = 50;
		$(this).find('.modal-body').height(TotalHeight - HeaderHeight - ContentPadding);
	});
	
	$(ActionDialogContainer).on('hidden', '.modal', function(){
		ThisClass.ShowScrollbars();
	});
	
	$('body').on('click', '.btn-template-variant-code', function(){
		$(this).closest('.alert').removeClass('alert-info').addClass('alert-success');
		
		var ContentClassTemplateVariantGuid = $(this).attr('data-guid');
		var ContentClassTemplatePath =  $(this).attr('data-path');
		
		ThisClass.UpdateArea(ThisClass.TemplateDialog, undefined, {'name': ContentClassTemplatePath, 'class': 'template-variant-code'});
		
		$ActionDialogModal = $(ActionDialogContainer).find('.modal');	
		$ActionDialogModal.modal('show');
		
		ThisClass.ListContentClassTemplateVariantCode(ContentClassTemplateVariantGuid, function(Data){
			SyntaxHighlighter.highlight();
		});
	});
	
	$('body').on('click', '.btn-element-usage', function(){
		var ContentClassTemplateVariantGuid = $(this).attr('data-guid');
		var ContentClassTemplatePath =  $(this).attr('data-path');
		var ContentClassGuid = $(this).closest('.alert').attr('data-guid');
		
		ThisClass.UpdateArea(ThisClass.TemplateDialog, undefined, {'name': ContentClassTemplatePath, 'class': ''});
		
		$ActionDialogModal = $(ActionDialogContainer).find('.modal');	
		$ActionDialogModal.modal('show');
		
		ThisClass.ListContentClassTemplateVariantElementUsage(ContentClassGuid, ContentClassTemplateVariantGuid);
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
				'path': ContentClassFolderName + ' / ' + $(this).attr('name')
			};
			
			ContentClasses.push(ContentClass);
		});

		var ContentClassesJson = {
			'contentclasses': ContentClasses
		};

		ThisClass.UpdateArea(ThisClass.TemplateContentClasses, '.' + ContentClassFolderGuid, ContentClassesJson);
		
		ThisClass.UpdateArea(ThisClass.TemplateContentClassesCount, '.' + ContentClassFolderGuid, {'count': ContentClasses.length});
		
		if(CallbackFunc){
			CallbackFunc(ContentClasses);
		}
	});
}

ContentClassInspector.prototype.ListContentClassTemplates = function(Path, ContentClassGuid, ProjectVariantGuids, CallbackFunc) {
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
				'path': Path,
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

		ThisClass.UpdateArea(ThisClass.TemplateContentClassTemplates, '.' + ContentClassGuid, ContentClassTemplatesJson);

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
			CallbackFunc(TemplateVariantCode);
		}
	});
}


ContentClassInspector.prototype.ListContentClassTemplateVariantElementUsage = function(ContentClassGuid, ContentClassTemplateVariantGuid, CallbackFunc) {
	var ThisClass = this;
	
	this.LoadElementsInContentClass(ContentClassGuid, function(Data){
		var ContentClassElements = Data;
		var ContentClassElementsSorted = [];
		
		ThisClass.LoadElementsInContentClassTemplateVariant(ContentClassTemplateVariantGuid, function(Data){
			var ContentClassTemplateVariantElements = Data;
			
			$.each(ContentClassTemplateVariantElements, function(){
				var ContentClassTemplateVariantElement = this;
				var Found = false;

				$.each(ContentClassElements, function(){
					var ContentClassElement = this;

					if(ContentClassTemplateVariantElement.name == ContentClassElement.name ){
						Found = true;
					}
				});

				if(Found){
					ContentClassElementsSorted.push(ContentClassTemplateVariantElement);
				}
			});
			
			$.each(ContentClassElements, function(){
				var ContentClassElement = this;
				var Found = false;
				
				$.each(ContentClassElementsSorted, function(){
					var ContentClassElementSorted = this;
					
					if(ContentClassElementSorted.name == ContentClassElement.name ){
						Found = true;
					}
				});
				
				if(!Found){
					ContentClassElementsSorted.push(ContentClassElement);
				}
			});
			
			var ContentClassElementsJson = {
				'contentclasselements': ContentClassElementsSorted,
				'templateelements': ContentClassTemplateVariantElements
			}
			
			ThisClass.UpdateArea(ThisClass.TemplateDialogTemplateVariantElementUsage, undefined, ContentClassElementsJson);
		});
	});
}


ContentClassInspector.prototype.LoadElementsInContentClass = function(ContentClassGuid, CallbackFunc) {
	var ThisClass = this;
	
	var RqlXml = '<PROJECT><TEMPLATE action="load" guid="' + ContentClassGuid + '"><ELEMENTS childnodesasattributes="0" action="load"/><TEMPLATEVARIANTS action="list"/></TEMPLATE></PROJECT>';
	this.RqlConnectorObj.SendRql(RqlXml, false, function(data){
		var Elements = [];

		$(data).find('ELEMENT').each(function(){
			if($(this).attr('eltname')){
				var ElementObj = {
					guid: $(this).attr('guid'),
					name: $(this).attr('eltname')
				};
				
				Elements.push(ElementObj);
			}
		});
		
		if(CallbackFunc){
			CallbackFunc(Elements);
		}
	});
}

ContentClassInspector.prototype.LoadElementsInContentClassTemplateVariant = function(ContentClassTemplateVariantGuid, CallbackFunc) {
	var ThisClass = this;
	
	var RqlXml = '<PROJECT><TEMPLATE><TEMPLATEVARIANT action="load" readonly="1" guid="' + ContentClassTemplateVariantGuid + '" /></TEMPLATE></PROJECT>';
	this.RqlConnectorObj.SendRql(RqlXml, false, function(data){
		var Elements = [];
		var ElementNames = [];
		var TemplateRegexp = new RegExp('<' + '%([_\-a-zA-Z0-9]+?)%' + '>', 'ig');
		var Match = null;
		
		while(Match = TemplateRegexp.exec($(data).text()))
		{
			ElementName = Match[1];
			
			if($.inArray(ElementName, ElementNames) == -1)
			{
				ElementNames.push(ElementName);
			
				var ElementObj = {
					name: ElementName
				};
				
				Elements.push(ElementObj);
			}
		}

		if(CallbackFunc){
			CallbackFunc(Elements);
		}
	});
}

ContentClassInspector.prototype.ShowScrollbars = function() {
	$('body').css('overflow', 'auto');
}

ContentClassInspector.prototype.HideScrollbars = function() {
	$('body').css('overflow', 'hidden');
}

ContentClassInspector.prototype.CopyToClipboard = function(Text) {
	window.clipboardData.setData('Text', Text);
}

ContentClassInspector.prototype.UpdateArea = function(TemplateId, DataContainerAdditional, Data){
	var ContainerId = $(TemplateId).attr('data-container');
	if(DataContainerAdditional) {
		ContainerId = DataContainerAdditional + ' ' + ContainerId;
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