(function() {
    var CACOO_BASE_URL = 'https://cacoo.com/diagrams/';

    tinymce.create('tinymce.plugins.Cacoo', {
        cacooIconURL: null,
        getInfo : function() {
            return {
                longname : 'Draw graphics, charts, diagrams plugin.',
                author : 'Nulab Inc.',
                authorurl : 'http://cacoo.com/',
                infourl : 'http://cacoo.com/',
                version : "0.1"
            };
        },
        init : function(ed, url) {
            var self = this;
            self.url = url;
            self.cacooIconURL = url + '/../images/cacoo.png';
            self.editor = ed;
            ed.addCommand('Cacoo',
                function() {
                    self.openDialog(ed);
                });
            ed.addButton('Cacoo', {
                title : 'Insert Diagrams for Cacoo',
                cmd : 'Cacoo',
                image : self.cacooIconURL});

        },
        openDialog : function(ed) {
            var self = this;
            var $ = jQuery;
            var model = {
                SIZE_TYPE_CUSTOM: 'custom',
                SIZE_TYPE_CHOICE: 'choice',
                page: 1,
                url: '',
                width: 400,
                height: 300,
                sizeType: 'choice',
                theme: 'cacoo',
                toolbar: true,
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
                    ed.execCommand('mceInsertContent', false, tag);
                    $dialog.dialog('destroy');
                    $dialog.remove();
                },
                cancel: function() {
                    $dialog.dialog('destroy');
                    $dialog.remove();
                },
                getViewerURL: function() {
                    if (this.isViewer()) {
                        return this.url + '/view?w=' + this.width + '&h=' + this.height + '&tm=' + this.theme + '&tb=' + (this.toolbar ? 'yes' : 'no');
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
                    if (this.toolbar != true) {
                        tag += ' toolbar="no"';
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
                },
                setToolbar: function(toolbar) {
                    model.toolbar = toolbar;
                    view.updatePreview();
                }
            };

            var view = {
                init: function() {
                    return $(
                        '<div id="cacoo-dialog">' +
                            '<div id="cacoo-dialog-page1" class="cacoo-dialog-content">' +
                            '<div id="cacoo-dialog-message"><p>' + CACOO_RES['info'] +  '</p><p><strong>' + CACOO_RES['example'] +  ':</strong><br/><code>https://cacoo.com/diagrams/7EpibmlIXIjpzvNa</code>(' + CACOO_RES['viewer'] +  ')<br/><code>https://cacoo.com/diagrams/7EpibmlIXIjpzvNa-3DE17.png</code>(' + CACOO_RES['image'] +  ')</p></div>' +
                            '<div id="cacoo-dialog-buttons">' +
                            '<input type="button" value="' + CACOO_RES['button_cancel'] +  '" class="cacoo-dialog-cancel"/>' +
                            '<input type="button" value="' + CACOO_RES['button_next'] +  '" id="cacoo-dialog-next"/>' +
                            '</div>' +
                            '<p>URL:<input type="text" style="width: 400px;" id="cacoo-dialog-input"/></p>' +
                            '<input type="hidden" id="cacoo-dialog-tag" value="cacoo"/>' +
                            '<p id="cacoo-dialog-filter-panel">' + CACOO_RES['filter'] +  ':<input type="text" style="width: 400px;" id="cacoo-dialog-filter"/>&nbsp;&nbsp;' + CACOO_RES['folder'] +  ':<select id="cacoo-dialog-filter-folder"/></p>' +
                            '<p id="cacoo-dialog-choice-dialog-back-panel"><input type="button" value="Back to Diagrams" id="cacoo-dialog-choice-diagram-back"><input type="button" value="Select this Viewer URL" id="cacoo-dialog-choice-diagram-select-viewer"><span class="warning"><b>' + CACOO_RES['info_private_diagram_warning'] + '</b></span></comment></comment></p>' +
                            '<div class="cacoo-dialog-slide cacoo-dialog-content" id="cacoo-dialog-slide" style="height: ' + ($('html').innerHeight() - 230) + 'px">' +
                            '</div>' +
                            '<div class="cacoo-dialog-slide cacoo-dialog-content" id="cacoo-dialog-choice-diagram" style="height: ' + ($('html').innerHeight() - 230) + 'px"></div>' +
                            '</div>' +
                            '<div id="cacoo-dialog-page2" class="cacoo-dialog-content" style="display:none;">' +
                            '<div id="cacoo-dialog-message"><p><strong>URL:</strong><code id="cacoo-dialog-url"></code></p></div>' +
                            '<div id="cacoo-dialog-buttons">' +
                            '<input type="button" value="' + CACOO_RES['button_cancel'] +  '" class="cacoo-dialog-cancel"/>' +
                            '<input type="button" value="' + CACOO_RES['button_back'] +  '" id="cacoo-dialog-back"/>' +
                            '<input type="button" value="' + CACOO_RES['button_insert'] +  '" id="cacoo-dialog-insert"/>' +
                            '</div>' +
                            '<p>' + CACOO_RES['size'] +  ':' +
                            '<span id="cacoo-dialog-size-choice"><select id="cacoo-dialog-size-select"><option value="400x300" selected="true">400x300</option><option value="600x450">600x450</option><option value="800x600">800x600</option><option value="1000x750">1000x750</option></select> ' + CACOO_RES['pixels'] +  ' <a href="javascript:void(0)">' + CACOO_RES['custom'] +  '</a></span>' +
                            '<span id="cacoo-dialog-size-custom" style="display:none;"><input type="text" style="width: 50px;" class="cacoo-dialog-dim" id="cacoo-dialog-width" value=""/> × <input type="text" style="width: 50px;" class="cacoo-dialog-dim" id="cacoo-dialog-height" value=""/> ' + CACOO_RES['pixels'] +  '<a href="javascript:void(0)">' + CACOO_RES['choice'] +  '</a></span>' +
                            ' &nbsp;&nbsp;' +
                            '<span id="cacoo-dialog-theme">' + CACOO_RES['theme'] +  ':<label><input type="radio" name="theme" value="cacoo" checked="checked"/>Cacoo</label><label><input type="radio" name="theme" value="clear"/>Clear</label></span>' +
                            ' &nbsp;&nbsp;' +
                            '<span id="cacoo-dialog-toolbar">' + CACOO_RES['toolbar'] +  ':<label><input type="radio" name="toolbar" value="true" checked="checked"/>' + CACOO_RES['always_show'] +  '</label><label><input type="radio" name="toolbar" value="false"/>' + CACOO_RES['show_with_mouseover'] + '</label></span>' +
                            '</p>' +
                            '<p>' + CACOO_RES['preview'] +  ':' +
                            '<div class="cacoo-dialog-slide cacoo-dialog-content" id="cacoo-dialog-slide">' +
                            '<iframe src="" width="100%" height="' + ($('html').innerHeight() - 230) + '" id="cacoo-dialog-iframe-preview" scrolling="auto"/><br/>' +
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
                    } else if (model.page == 2) {
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
                    $('#cacoo-dialog input[name=toolbar]').change(function() {
                        model.setToolbar($(this).val() == 'true');
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

            var buildPanel = function() {
                var $panel = $('#cacoo-dialog-slide').empty();
                CACOO.get('/diagrams.json', {}, function(result) {
                    var folders = {};
                    $.each(result.result, function(i, it) {
                        if (it.sheetCount == 0) {
                            return;
                        }
                        it.keyword = it.title.toUpperCase();
                        if (it.folderName) {
                            folders[it.folderId] = folders[it.folderId] || {count: 0};
                            folders[it.folderId].folderName = it.folderName;
                            folders[it.folderId].count++;
                        }
                        var $diagram = $('<div>')
                            .addClass('cacoo_diagram')
                            .addClass('cacoo_security_' + it.security).data(it)
                            ;

                        var $imageBox = $('<div>')
                            .addClass('cacoo_image_box')
                            .click(function() {
                                $('#cacoo-dialog-input').val(it.url);
                                $('#cacoo-dialog-slide').hide();
                                $('#cacoo-dialog-choice-diagram').show();
                                $('#cacoo-dialog-filter-panel').hide();
                                $('#cacoo-dialog-choice-dialog-back-panel').show();
                                $('#cacoo-dialog-choice-diagram-select-viewer').data(it);
                                if (it.security == 'private') {
                                    $('#cacoo-dialog .warning').show();
                                } else {
                                    $('#cacoo-dialog .warning').hide();
                                }
                                updateChoiceDiagram(it);
                            })
                            .appendTo($diagram);
                        var src = CACOO.getURL('/diagrams/' + it.diagramId + '.png', {width: 140, height: 100});
                        $('<img>').addClass('cacoo_preview').attr({
                            src: src
                        }).appendTo($imageBox);
                        var $info = $('<div>')
                            .addClass('cacoo_title')
                            .append(
                            $('<a>')
                                .attr({
                                    href: it.url,
                                    target: '_blank'
                                })
                                .text(it.title)
                        )
                            .append(
                            $('<span>').text('(' + it.sheetCount + ')')
                        )
                            .append(
                            it.security == 'private' ? $('<img>').attr('src', self.url + '/../images/private.png') : null
                        )
                            .appendTo($diagram);
                        $diagram.appendTo($panel);
                        $('<div>').append($('<span class="folderName">').text(it.folderName ? it.folderName : '')).appendTo($diagram);
                    });
                    var $folders = $('#cacoo-dialog-filter-folder').html('<option></option>');
                    for(var key in folders) {
                        var f = folders[key];
                        $('<option>').attr({value: key}).text(f.folderName + '(' + f.count + ')').appendTo($folders);
                    }
                });
                $('#cacoo-dialog-filter').keyup(function() {
                    updateImageList();
                });
                $('#cacoo-dialog-filter-folder').change(function() {
                    updateImageList();
                });

                $('#cacoo-dialog-choice-diagram-back').click(function() {
                    $('#cacoo-dialog-slide').show();
                    $('#cacoo-dialog-choice-diagram').hide();
                    $('#cacoo-dialog-filter-panel').show();
                    $('#cacoo-dialog-choice-dialog-back-panel').hide();
                });
                $('#cacoo-dialog-choice-diagram-select-viewer').click(function() {
                    $('#cacoo-dialog-input').val($(this).data().url);
                     model.next();
                });
                var updateChoiceDiagram = function(it) {
                    var $panel = $('#cacoo-dialog-choice-diagram').empty();
                    // get diagram
                    var diagram = it;
                    CACOO.get('/diagrams/' + it.diagramId + '.json', {}, function(result) {
                        $.each(result.sheets, function(i, it) {
                            var $diagram = $('<div>')
                                .data(it)
                                .addClass('cacoo_diagram')
                                .click(function() {
                                    $('#cacoo-dialog-input').val($(this).data().imageUrl);
                                    model.next();
                                });
                            var src = CACOO.getURL('/diagrams/' + diagram.diagramId + '-' + it.uid + '.png', {width: 140, height: 100});
                            var $imageBox = $('<div>').addClass('cacoo_image_box').appendTo($diagram);
                            $('<img>').addClass('cacoo_preview').attr({
                                src: src
                            }).appendTo($imageBox);
                            $('<div>')
                                .addClass('cacoo_title')
                                .append(
                                $('<a>')
                                    .attr({
                                        href: it.imageUrl,
                                        target: '_blank'
                                    })
                                    .text(it.name))
                                .appendTo($diagram);
                            $diagram.appendTo($panel);
                        });
                    });
                };

                var updateImageList = function() {
                    var text = $('#cacoo-dialog-filter').val().toUpperCase();
                    var folderId = parseInt($('#cacoo-dialog-filter-folder').val());
                    $panel.find('div.cacoo_diagram').each(function() {
                        var textMatch = !text || $(this).data().keyword.indexOf(text) != -1;
                        var folderMatch = !folderId || $(this).data().folderId == folderId;
                        if (textMatch && folderMatch) {
                            $(this).show();
                        } else {
                            $(this).hide();
                        }
                    });
                };
            };

            var login = function() {
                CACOO.login(function(oauth) {
                    CACOO.get("/account.json", {}, function(account) {
                        var params = {
                          oauth_token: oauth.oauthToken,
                          token_secret: oauth.tokenSecret,
                          nickname: account.nickname,
                          image_url: account.imageUrl
                        };
                        jQuery.get("options-general.php?page=cacoo&cmd=update", params, function() {
                        });
                        buildPanel();
                    }, function() {
                        if (confirm(CACOO_RES['confirm_retry_login'])) {
                            jQuery.get("options-general.php?page=cacoo&cmd=remove", {}, function() {
                                CACOO.logout();
                                login();
                            });
                        }
                    });
                });
            };

            var $dialog = view.init();
            view.update();
            $dialog.dialog({
                title: '<img src="' + self.cacooIconURL + '" width="20" height="20" /> Cacoo for WordPress',
                bgiframe: true,
                autoOpen: true,
                width: '95%',
                modal: true,
                open: function() {
                    controller.init();
                    login();
                }
            });
        }
    });
    tinymce.PluginManager.add('Cacoo', tinymce.plugins.Cacoo);
})();