/*
* Author: Stanislav Zaichenko;
* We will PackYou bitch
*/

(function ($) {
    var selectors = {
        removeButton: '#removeItemButton'
    };

    var $bagControl;

    var pluginMethods = {
        init: function () {

            return this.each(function () {

                // Internal vars;    
                var $this = $bagControl = $(this),
                    $thisSectionHeaders = $this.children('.section-header'),
                    $thisSectionContainers = $this.children('.section-container'),
                    $thisSectionItems = $thisSectionContainers.children('.section-item'),
                    $thisSectionSubItemsContainers = $this.find('.section-item-container');

                // Caching selectors;
                var $removeButton = $(selectors.removeButton);

                // Open and close sections
                $this.delegate('.section-header', 'click', function (evt) {
                    var $thisHeder = $(this),
                        $thisContainer = $thisHeder.next();

                    // Whem select/deselect button cklicked do not open section;
                    if (evt.target.tagName === 'SPAN')
                        return false;

                    if ($thisContainer.is(':hidden')) {
                        $thisContainer.slideDown('fast');
                    } else {
                        $thisContainer.slideUp('fast');
                    }
                });

                // Item selection and deselection logic;
                // this function handles clicks on different elements of the item;
                $this.delegate('.section-item, .group-selector, .section-subitem', 'click', function (evt) {
                    var $thisItem = $(this).hasClass('group-selector') ? $(this).parent() : $(this),
                        $thisInput = $('input.items-quantity', $thisItem),
                        isSelected = $thisItem.hasClass('selected');

                    // Handle qty input focus and item selection;
                    if (evt.target.tagName === 'INPUT' && evt.target.className === 'items-quantity') {
                        if (!isSelected) {
                            $thisItem.addClass('selected');
                        }
                        return false;
                    }

                    // Handle select/deselect group button;
                    if (evt.target.tagName === 'SPAN' && evt.target.className === 'group-selector') {
                        if (isSelected) {
                            $(evt.target).text('Select Group');
                            // TO DO: Add/remove css class here
                        } else {
                            $(evt.target).text('Selected...');
                            // TO DO: Add/remove css class here
                        }
                    }

                    // Prevent Item selection onclick edit-item icon and input extension
                    if ((evt.target.tagName === 'SPAN' && evt.target.className === 'edit-extension-icon') ||
                        (evt.target.tagName === 'INPUT' && evt.target.className === 'item-extension')) {
                        return false;
                    }

                    if (evt.target.tagName === 'SPAN' && $(evt.target).hasClass('item-packed-flag')) {
                        return;
                    }
                    // Get the section headers span 'group selector' element, parent of the clicked one;
                    var $groupSelector = $(evt.target).parents('.section-container').prev('div').find('.group-selector');

                    if (isSelected) {
                        $thisItem.removeClass('selected');
                        $thisInput.val(1);

                        handleSelection('deselect', { targetItem: $thisItem });
                        $groupSelector.text('Select Group');

                    } else {
                        handleSelection('select', { targetItem: $thisItem });

                    }

                    // Update remove items button;
                    handleSelection('updateRemoveButton', { button: $removeButton, control: $this });
                });

                // Check/uncheck Packed item status;
                $this.delegate('.item-packed-flag', 'click', function (evt) {
                    handleSelection('setItemsPacked', { targetItem: $(evt.target), event: evt });
                });

                // Expand or collapse subitems section
                $this.delegate('.section-subitems-expander', 'click', function () {
                    var $bagItem = $(this).parent('div'),
                        $thisSubItemSection = $bagItem.next('div'),
                        isExpandable = $bagItem.data('expandable');
                    // TO DO: create separate button for 
                    // expanding subitem section; Likely arrow down icon;
                    if (isExpandable) { // TO DO: do something with it;
                        if ($thisSubItemSection.is(':hidden')) {
                            $thisSubItemSection.slideDown('fast');
                        } else {
                            $thisSubItemSection.slideUp('fast');
                        }
                    }
                    return false;
                });

                // Items extension editing
                $this.delegate('.edit-extension-icon', 'click', function () {
                    var $extensionInput = $(this).prevAll('input'),
                        $name = $(this).prev('span'),
                        $item = $(this).parent('div'),
                        isInEditState = $(this).data('edit-state');

                    // Store init name
                    $name.data('init-name', $extensionInput.attr('placeholder')); // TO DO:  consider getting init name other way;
                    var storedName = $name.data('init-name');

                    if (!isInEditState) {
                        $extensionInput.show();
                        $name.hide();
                        $(this).data('edit-state', true);

                    } else {
                        $extensionInput.hide();

                        if ($.trim($extensionInput.val())) {
                            $name.text($extensionInput.val());
                            // Accept name if it's not defult bags name;
                            if ($.trim($extensionInput.val() != storedName)) {
                                $item.data('name', $extensionInput.val());
                                $item.data('is-custom-name', 1);
                            }
                        } else {
                            $name.text(storedName);
                        }

                        $name.show();
                        $(this).data('edit-state', false);
                    }
                });


            });
        },
        // Unselects all itemes in whole Bag control
        unselectItems: function (items) {
            $(items, this).each(function () {
                var $this = $(this),
                    $thisInput = $('input', $this);

                $this.removeClass('selected');
                $thisInput.val(1);
            });

        },
        // Compare all selected check boxes number to subitems number, 
        // and selects parent ietem checkbox
        setAllItemsPacked: function (bagControl) {
            var checkedItemsCount = 0,
                bagControl = bagControl || this,
                $items = $('.section-item', bagControl);

            $.each($items, function (index, item) {
                var subitems = $(item).next('.section-item-container').find('.section-subitem');
                $.each(subitems, function (index, subitem) {
                    if ($(subitem).find('.item-packed-flag').hasClass('item-packed-flag-selected')) {
                        checkedItemsCount++;
                    }
                });
                if (subitems.length === checkedItemsCount) {
                    $('.item-packed-flag', item).addClass('item-packed-flag-selected');
                }
                checkedItemsCount = 0;
            });
        }
    };

    //##  Helper functions:

    // Function warapper. The purpose of this function select or deselect items and "packed" checkboxes through all items hierarchy;
    // Accepts two parameters: String 'Name of the method'; Object extra options;
    function handleSelection(method, params) {
        // Define if top cateory was selected;
        // var isRootItem = $targetItem.hasClass('section-header');

        var methods = {
            select: function (params) {
                // Define if root Group header was selected;
                var isGroupRoot = params.targetItem.hasClass('section-header');
                // Define if root Item header was selected;
                var isItemRoot = params.targetItem.hasClass('section-item');
                // Set clicked item selected;
                params.targetItem.addClass('selected');

                if (isGroupRoot) {
                    // Run over all child nodes and select them;
                    params.targetItem.next('div').find('.section-item').each(function () {
                        $(this).addClass('selected')
                                            .next('div')
                                            .find('.section-subitem')
                                            .each(function () {
                                                $(this).addClass('selected');
                                            });
                    });
                } else if (isItemRoot) {
                    // Run over all subitems and select them
                    params.targetItem.next('div').find('.section-subitem').each(function () {
                        $(this).addClass('selected');
                    });
                }
            },
            deselect: function (params) {
                // Define if top cateory was selected;
                var isRootItem = params.targetItem.hasClass('section-header');
                // Set clicked item selected;
                // $targetItem.removeClass('selected');
                params.targetItem.removeClass('selected');
                // Toggle visual category 'selector'button

                if (isRootItem) {
                    // Run over all child nodes and select them;
                    params.targetItem.next('div').find('.section-item').each(function () {
                        $(this).removeClass('selected')
                                            .next('div')
                                            .find('.section-subitem')
                                            .each(function () {
                                                $(this).removeClass('selected');
                                            });
                    });

                } else {
                    params.targetItem.parent('div').prev('div').removeClass('selected');

                    if (params.targetItem.parent('div').parent('div.section-container').length > 0) {
                        params.targetItem.parent('div')
                                            .parent('div')
                                            .prev('div')
                                            .removeClass('selected');

                    } else if (params.targetItem.next('div').children('div').length > 0) {
                        params.targetItem
                                            .next('div')
                                            .children('div')
                                            .each(function () {
                                                $(this).removeClass('selected');
                                            });
                    }
                }
            },
            setItemsPacked: function () {
                // Define if checkbox is in root Item header;
                var isRoot = params.targetItem.parent('div').hasClass('section-item'),
                    isTargetChcked = params.targetItem.hasClass('item-packed-flag-selected'),
                    $rootCheckBox;

                // Select or deselect child items in the tree;
                if (isRoot) {
                    // Set 'checked' class and data value for the root category item;
                    if (!isTargetChcked) {
                        params.targetItem.addClass('item-packed-flag-selected')
                        params.targetItem.data('is-item-packed', true);
                    } else {
                        params.targetItem.removeClass('item-packed-flag-selected');
                        params.targetItem.data('is-item-packed', false);
                    }

                    // Run through Items children and Set/Unset their checkboxes
                    params.targetItem
                        .parent('div')
                        .next('div')
                        .find('.section-subitem')
                        .each(function () {
                            if (!isTargetChcked) {
                                // Add class to only not selectes items;
                                $(this).find('span.item-packed-flag')
                                            .not('.item-packed-flag-selected')
                                                .addClass('item-packed-flag-selected');
                                // Set stutus to data for bag saving
                                $(this).data('is-packed', true);
                            } else {
                                $(this).find('span.item-packed-flag')
                                    .removeClass('item-packed-flag-selected');
                                // Set status to data
                                $(this).data('is-packed', false);
                            }
                        });

                } else {
                    // Set clicked item selected or deselect it;
                    if (!isTargetChcked) {
                        params.targetItem.addClass('item-packed-flag-selected')
                        params.targetItem.parent('div').data('is-packed', true);
                    } else {
                        params.targetItem.removeClass('item-packed-flag-selected')
                        params.targetItem.parent('div').data('is-packed', false);
                    }

                    // As for now removing packed status mark from parent Item
                    //TO DO: Add logic for check/uncheck parent Item as if all children has been checked
                    params.targetItem
                        .parents('.section-item-container')
                            .prev('div.section-item')
                                .find('span.item-packed-flag')
                                    .removeClass('item-packed-flag-selected');

                    pluginMethods.setAllItemsPacked($bagControl);
                }

            },
            updateRemoveButton: function (params) {
                var toggle = params.control.find('.selected').length >= 1 && params.control.attr('id') === 'bagControl' ? true : false;

                if (toggle) {
                    params.button.removeAttr('disabled');
                } else {
                    params.button.attr('disabled', true);
                }
            }
        };

        if (methods[method]) {
            methods[method](params);
        }
    }

    $.fn.packYouBagControl = function (method) {

        if (pluginMethods[method]) {
            return pluginMethods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (!method) {
            return pluginMethods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.tooltip');
        }

    };
})(jQuery);
