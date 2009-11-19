(function() {
    var $ = jQuery;
    var CACOO_BASE_URL = 'https://cacoo.com/diagrams/';
    var cacooIconURL = location.pathname + '/../../wp-content/plugins/cacoo-for-wordpress/resources/images/cacoo.png';

    var Cacoo = function() {
    };
    Cacoo.prototype.openDialog = function(opts) {
        var self = this;
        var model = {
            SIZE_TYPE_CUSTOM: 'custom',
            SIZE_TYPE_CHOICE: 'choice',
            page: 1,
            url: '',
            width: 400,
            height: 300,
            sizeType: 'choice',
            theme: 'cacoo',
            next: function() {
                this.page = 2;
                view.update();
            },
            back: function() {
                this.page = 1;
                view.update();
            },
            updateViewerPreviewURL: function() {
                $('cacoo-dialog-iframe').src = this.url + '/view?w=' + this.width + '&h=' + this.height;
            },
            insert: function() {
                var tag = this.getTag();
                opts.onInsert(tag);
                $dialog.dialog('destroy');
                $dialog.remove();
            },
            cancel: function() {
                $dialog.dialog('destroy');
                $dialog.remove();
            },
            getViewerURL: function() {
                if (this.isViewer()) {
                    return this.url + '/view?w=' + this.width + '&h=' + this.height + '&tm=' + this.theme;
                } else {
                    return this.url.substring(0, this.url.length - 4) + '-w' + this.width + '-h' + this.height + '.png';
                }
            },
            getTag: function() {
                if (this.isViewer()) {
                    return this.getViewerTag();
                } else {
                    return this.getImageTag();
                }
            },
            getViewerTag: function() {
                var tag = '';
                tag += '[cacoo';
                if (this.width != 400) {
                    tag += ' width="' + this.width + '"';
                }
                if (this.height != 300) {
                    tag += ' height="' + this.height + '"';
                }
                if (this.theme != 'cacoo') {
                    tag += ' theme="' + this.theme + '"';
                }
                tag += ']';
                tag += this.url;
                tag += '[/cacoo]';
                return tag;
            },
            getImageTag: function() {
                var tag = '';
                tag += '<img ';
                tag += ' src="' + this.url + '"';
                tag += ' width="' + this.width + '"';
                tag += ' height="' + this.height + '"';
                tag += '/>';
                return tag;
            },
            isViewer: function() {
                return this.url.substring(this.url.length - 4) != '.png'
            },
            setSizeType: function(sizeType) {
                model.sizeType = sizeType;
                view.updatePreview();
            },
            setSize: function(width, height) {
                this.width = width;
                this.height = height;
                view.updatePreview();
            },
            setTheme: function(theme) {
                model.theme = theme;                    
                view.updatePreview();
            }
        };
        
        var view = {
            init: function() {
                return $(
                    '<div id="cacoo-dialog">' +
                        '<div id="cacoo-dialog-page1" class="cacoo-dialog-content">' +
			            '<div id="cacoo-dialog-message"><p>Please enter the URL at which the diagram can be viewed.</p><p><strong>Example:</strong><br/><code>https://cacoo.com/diagrams/7EpibmlIXIjpzvNa</code>(Viewer)<br/><code>https://cacoo.com/diagrams/7EpibmlIXIjpzvNa-3DE17.png</code>(Image)</p></div>' +
                        '<div id="cacoo-dialog-buttons">' +
                        '<input type="button" value="Calcel" class="cacoo-dialog-cancel"/>' +
                        '<input type="button" value="Next" id="cacoo-dialog-next"/>' + 
                        '</div>' +
			            '<p>URL:<input type="text" style="width: 400px;" id="cacoo-dialog-input"/></p>' + 
			            '<input type="hidden" id="cacoo-dialog-tag" value="cacoo"/>' + 
                        '<div class="cacoo-dialog-slide cacoo-dialog-content" id="cacoo-dialog-slide">' +
                        '<iframe src="' + CACOO_BASE_URL  + '" width="100%" height="' + ($('html').attr('clientHeight') - 230) + '" id="cacoo-dialog-iframe" scrolling="auto"/><br/>' +
		                '</div>' +
		                '</div>' +
                        '<div id="cacoo-dialog-page2" class="cacoo-dialog-content" style="display:none;">' +
                        '<div id="cacoo-dialog-message"><p><strong>URL:</strong><code id="cacoo-dialog-url"></code></p></div>' +
                        '<div id="cacoo-dialog-buttons">' +
                        '<input type="button" value="Calcel" class="cacoo-dialog-cancel"/>' +
                        '<input type="button" value="Back" id="cacoo-dialog-back"/>' +
                        '<input type="button" value="Insert" id="cacoo-dialog-insert"/>' + 
                        '</div>' +
                        '<p>Size:' +
                        '<span id="cacoo-dialog-size-choice"><select id="cacoo-dialog-size-select"><option value="400x300" selected="true">400x300</option><option value="600x450">600x450</option><option value="800x600">800x600</option><option value="1000x750">1000x750</option></select> pixels <a href="javascript:void(0)">custom</a></span>' +
                        '<span id="cacoo-dialog-size-custom" style="display:none;"><input type="text" style="width: 50px;" class="cacoo-dialog-dim" id="cacoo-dialog-width" value=""/> × <input type="text" style="width: 50px;" class="cacoo-dialog-dim" id="cacoo-dialog-height" value=""/> pixels<a href="javascript:void(0)">choice</a></span>' +
                        ' &nbsp;&nbsp;' +
                        '<span id="cacoo-dialog-theme">Theme:<label><input type="radio" name="theme" value="cacoo" checked="checked"/>Cacoo</label><label><input type="radio" name="theme" value="clear"/>Clear</label></span>' +
                        '</p>' +
                        '<p>Preview:' + 
                        '<div class="cacoo-dialog-slide cacoo-dialog-content" id="cacoo-dialog-slide">' +
                        '<iframe src="" width="100%" height="' + ($('html').attr('clientHeight') - 230) + '" id="cacoo-dialog-iframe-preview" scrolling="auto"/><br/>' +
		                '</div>' + 
		                '</div>' +
		                '</div>' + 
                        '</div>'
                );
            },
            update: function() {
                if (model.page == 1) {
                    $('#cacoo-dialog-page1').show();
                    $('#cacoo-dialog-page2').hide();
                } else if (model.page == 2){
                    model.url = $('#cacoo-dialog-input').val();
                    $('#cacoo-dialog-page1').hide();
                    $('#cacoo-dialog-page2').show();
                    $('#cacoo-dialog-url').text(model.url);
                    view.updatePreview();
                }
            },
            updatePreview: function() {
                // update value
                $('#cacoo-dialog-width').val(model.width);
                $('#cacoo-dialog-height').val(model.height);
                $('#cacoo-dialog-iframe-preview').attr('src', '');
                $('#cacoo-dialog-iframe-preview').attr({
                    src: model.getViewerURL()
                });
                // update display
                if (model.sizeType == model.SIZE_TYPE_CUSTOM) {
                    $('#cacoo-dialog-size-choice').hide();
                    $('#cacoo-dialog-size-custom').show();
                } else if (model.sizeType == model.SIZE_TYPE_CHOICE) {
                    $('#cacoo-dialog-size-custom').hide();
                    $('#cacoo-dialog-size-choice').show();
                }
                if (model.isViewer()) {
                    $('#cacoo-dialog-theme').show();
                } else {
                    $('#cacoo-dialog-theme').hide();
                }
            }
        };
        
        var controller = {
            init: function() {
                $('#cacoo-dialog-next').click(function() {
                    model.next();
                });
                $('#cacoo-dialog-back').click(function() {
                    model.back();
                });
                $('#cacoo-dialog-insert').click(function() {
                    model.insert();
                });
                $('#cacoo-dialog .cacoo-dialog-cancel').click(function() {
                    model.cancel();
                });
                $('#cacoo-dialog-width').change(function() {
                    var width = parseInt($('#cacoo-dialog-width').val());
                    var height = parseInt($('#cacoo-dialog-height').val());
                    model.setSize(width, height);
                });
                $('#cacoo-dialog-height').change(function() {
                    var width = parseInt($('#cacoo-dialog-width').val());
                    var height = parseInt($('#cacoo-dialog-height').val());
                    model.setSize(width, height);
                });
                $('#cacoo-dialog input[name=theme]').change(function() {
                    model.setTheme($(this).val());
                });
                $('#cacoo-dialog-size-choice').change(function() {
                    var sizes = $('#cacoo-dialog-size-choice option:selected').val().split('x');
                    var width = parseInt(sizes[0]);
                    var height = parseInt(sizes[1]);
                    model.setSize(width, height);
                });
                $('#cacoo-dialog-size-choice a').click(function() {
                    model.setSizeType(model.SIZE_TYPE_CUSTOM);
                });
                $('#cacoo-dialog-size-custom a').click(function() {
                    model.setSizeType(model.SIZE_TYPE_CHOICE);
                });
            }
        }
        
        var $dialog = view.init();
        view.update();
        $dialog.dialog({
            title: '<img src="' + cacooIconURL + '" width="20" height="20" /> Cacoo for WordPress',
            bgiframe: true,
			autoOpen: true,
            width: '95%',
			height: $('html').attr('clientHeight'),
			modal: true,
            open: function() {
                controller.init();
            }
        });
    };

    var cacoo = new Cacoo();

    // Visual Editor
    if (window['tinymce']) {
        tinymce.create('tinymce.plugins.Cacoo', {
            cacooIconURL: null,
            getInfo : function() {
                return {
                    longname : 'The Cacoo plugin for WordPress allows you to create diagrams and insert them into your posts.',
                    author : 'Nulab Inc.',
                    authorurl : 'http://cacoo.com/',
                    infourl : 'http://cacoo.com/',
                    version : "0.7"
                };
            },
            init : function(ed, url) {
                var self = this;
                self.editor = ed;
                ed.addCommand('Cacoo',
                              function() {
                                  cacoo.openDialog({
                                      onInsert: function(tag) {
                                          ed.execCommand('mceInsertContent', false, tag);
                                      }
                                  });
                              });
                ed.addButton('Cacoo', {
                    title : 'Insert Diagrams for Cacoo',
                    cmd : 'Cacoo',
                    image : cacooIconURL});
                
            }
        });
        tinymce.PluginManager.add('Cacoo', tinymce.plugins.Cacoo);   
    }

    // HTML Editor
    if (window['edInsertContent']) {
        var $button = $('<input type="button" class="ed_button" title="Insert Diagrams for Cacoo" value="Cacoo" />').click(function() {
            cacoo.openDialog({
                onInsert: function(tag) {
                    edInsertContent(edCanvas, tag);
                }
            });
        });
        $('#ed_toolbar').append($button);
    }
})();
