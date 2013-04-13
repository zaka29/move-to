// Pack You package
var PackYou = (function (obj) {

    // Init options
    var controlSelectors = {
        wardrobeControl: '#wardrobeControl',
        bagControl: '#bagControl',
        groupHeader: '.section-header',
        groupSpanSelector: '.group-selector',
        packItemsRoot: '.section-container',
        packItem: '.section-item',
        packSubItem: '.section-subitem',
        packItemContainer: '.section-item-container',
        quantitySpan: '.item-qty-unit',
        moveItem: '#moveItemButton',
        saveButton: '#saveItemButton',
        removeButton: '#removeItemButton',
        bagTemplate: '#bagTemplate',
        newBagNameInput: '#newBagName'
    };

    // Internal vars
    var groups = [],
        saveBagData = [],
        $wardRobeControlElement,
        $bagControlElement,
        $moveItemButton,
        $saveBagButton,
        $bagTemplate,
        $removeButton;


    var PackControl = {
        // Initialization 
        init: function (options) {

            var instance = this;

            if (options) {
                $.extend(controlSelectors, options);
            }

            // Caching jQuery selectors: improves perfomance.
            $wardRobeControlElement = $(controlSelectors.wardrobeControl);
            $bagControlElement = $(controlSelectors.bagControl);
            $moveItemButton = $(controlSelectors.moveItem);
            $saveBagButton = $(controlSelectors.saveButton);
            $bagTemplate = $(controlSelectors.bagTemplate);
            $removeButton = $(controlSelectors.removeButton);

            // Init PackYou wardrobe control
            $wardRobeControlElement.packYouBagControl();

            // Init PackYou bag control
            $bagControlElement.packYouBagControl();

            // Moving items
            $moveItemButton.bind('click', instance.moveItemToBag);

            // Binds save bag handlers according to the page;
            // TO DO: Refactor
            if (saveBagAction) {
                //instance.saveCustomBag();
                $saveBagButton.bind('click', instance.saveCustomBag);
            } else {
                //instance.saveNewBag();
                $saveBagButton.bind('click', instance.saveNewBag);
            }

            // Remove selected items from Bag
            $removeButton.bind('click', function () {
                instance.removeSelectedItemsFromBag($bagControlElement);
                $(this).attr('disabled', true);
            });
        },
        moveItemToBag: function () {

            var $sectionItems = $wardRobeControlElement.children(controlSelectors.packItemsRoot),
                $sectionHeaders = $(controlSelectors.groupHeader, $(controlSelectors.wardrobeControl)).filter('.selected'),
                $items = $sectionItems.children().filter('.selected'),
                filter = [],
                isGroup = $bagControlElement.children(controlSelectors.packItemsRoot).length > 0 ? true : false;

            var $bagItems = $items.clone();

            // Unselect wardrobe headers when wardrobe items is moved to bag;
            $sectionHeaders.each(function () {
                $(this).removeClass('selected');
                $(this).children(controlSelectors.groupSpanSelector).text('Select Group');
            });

            // Filter items
            $bagItems.each(function () {
                // Get name of itmes parent group
                // var itemParentGroup = $(this).data('group');
                var itemParentGroupId = $(this).data('group-id');

                // remove class 'selected' to prevent getting list of moved items
                $(this).removeClass('selected');

                // Filter all repeated 'group' items
                if ($.inArray(itemParentGroupId, filter) === -1) {
                    filter.push(itemParentGroupId);
                }

            });

            // Build categories/groups objects array
            $.each(filter, function (i, g) {
                var j = {},
                    gName = $('div[data-group-id="' + g + '"]', $sectionItems).data('group');

                j[g] = { GroupName: gName, GroupId: g, Items: [] };
                groups.push(j);
            });

            // Feed Items array with selected iems contents
            $.each(groups, function (i, g) {

                $.each(g, function (k, v) {
                    $bagItems.each(function () {
                        var $this = $(this),
                        //itemContents = $this.data('name'),
                        //itemID = $this.data('item-id'),
                        //itemBagID = $this.data('bag-id'),
                        //itemIsExpandable = $this.data('expandable'),
                            itemQuantity = $('input', $this).val();

                        if (k == $this.data('group-id')) {
                            $.each(v, function (c, h) {
                                if (h.constructor === Array) {
                                    var items = {};
                                    items['Name'] = $this.data('name');
                                    items['ItemID'] = $this.data('item-id');
                                    items['ItemBagID'] = $this.data('bag-id');
                                    items['isExpandable'] = $this.data('expandable') === 'True' ? true : false;
                                    items['isCustomName'] = $this.data('is-custom-name');
                                    items['ItemQuantity'] = []; //itemQuantity;
                                    // Set subitems;
                                    for (var i = 0; i < itemQuantity; i++) {
                                        items['ItemQuantity'].push($this.data('name'));
                                    }

                                    h.push(items); // itemContents
                                }
                            });
                        }
                    });
                });
            });

            //console.log(groups);
            // Check if group already exists
            if (!isGroup) {

                // Insert template into Bag accordion 
                $('#bagTemplateEmpty').tmpl(groups).appendTo(controlSelectors.bagControl);

                // Unselect wardrobe items 
                $wardRobeControlElement.packYouBagControl('unselectItems', controlSelectors.packItem);

                // Activate save bag button;
                $saveBagButton.removeAttr('disabled');

            } else {
                // Just for test;
                //window.tmpGroup = groups;

                var $bagControlGroups = $bagControlElement.children(controlSelectors.packItemsRoot),
                    bagGroups = [],
                    bagGroupsMissed = [];

                // Collect all groups in bag        
                $bagControlGroups.each(function () {
                    var groupId = $(this).data('groupid');
                    bagGroups.push(groupId);
                });

                // Find which group is missing
                $.each(filter, function (k, v) {
                    if ($.inArray(v, bagGroups) === -1) {
                        bagGroupsMissed.push(v);
                    }
                });


                // TO DO: create and insert missed group section in PackYou Bag control.
                // Create new group
                var groupsCollection = [];

                groupsCollection.splice(0, groupsCollection.length);

                if (bagGroupsMissed.length > 0) {
                    $.each(bagGroupsMissed, function (k, v) {
                        var $sectionHeaderElement = $('<div class="section-header"><span></span><span class="group-selector">Select Group </span></div>'),
                            $sectionItemsEelement = $('<div class="section-container"></div>'),
                            missedGroupName = $('div[data-groupid="' + v + '"]', $wardRobeControlElement).data('group');

                        $sectionHeaderElement.children('span:first-child').text(missedGroupName);
                        $sectionItemsEelement.attr('data-groupid', v);
                        $sectionItemsEelement.attr('data-group', missedGroupName);

                        groupsCollection.push($sectionHeaderElement);
                        groupsCollection.push($sectionItemsEelement);
                    });
                }
                //Insert new groups into bag
                $.each(groupsCollection, function () {
                    $bagControlElement.append($(this));
                });

                // Fill groups with items
                // Must recreate jQuery obj for bagControlElement sectionItems as it was modified
                $bagControlElement.children(controlSelectors.packItemsRoot).each(function () {
                    var $bagGroup = $(this),
                        $bagGroupItems = $bagGroup.children(controlSelectors.packItem),
                        bagGroupId = $bagGroup.data('groupId');

                    $bagItems.each(function () {
                        var $thisWardrobeItem = $(this),
                            wardRobeItemName = $thisWardrobeItem.data('name'),
                            wardrobeItemId = $thisWardrobeItem.data('item-id'),
                            wardrobeItemQuantity = parseInt($('input', $thisWardrobeItem).val()),
                            wardRobeGroupId = $thisWardrobeItem.data('group-id'),
                            wardRobeItemBagId = $thisWardrobeItem.data('bag-id'),
                            isCustomName = $thisWardrobeItem.data('is-custom-name'),
                            itemsAdded = [];

                        // Looks for categories in the Bag
                        // Compare item parent group Id and target group id
                        if (bagGroupId == wardRobeGroupId) {

                            $bagGroupItems.each(function () {
                                var $thisBagItem = $(this),
                                    $bagItemQuantitySpan = $(controlSelectors.quantitySpan, $thisBagItem),
                                    bagItemId = $thisBagItem.data('item-id'),
                                    bagItemQuantity = parseInt($thisBagItem.data('item-quantity'));

                                // Look for the same items in bag: add quantity value or append .this bagItem to target group;
                                if (bagItemId == wardrobeItemId) {
                                    // Add quantity in items qty input field;
                                    $bagItemQuantitySpan.text('Qty: ' + (bagItemQuantity + wardrobeItemQuantity));
                                    $thisBagItem.data('item-quantity', bagItemQuantity + wardrobeItemQuantity);
                                    // Add subitems: the third level;
                                    var i = 0;
                                    while (i < wardrobeItemQuantity) {
                                        $('<div class="section-subitem"></div>')
                                        //.text(wardRobeItemName)
                                            .data('group-id', wardRobeGroupId)
                                            .data('bag-id', wardRobeItemBagId)
                                            .data('name', wardRobeItemName)
                                            .data('item-id', wardrobeItemId)
                                            .data('is-custom-name', isCustomName)
                                            .append('<input class="item-extension" type="text" placeholder="' + wardRobeItemName + '" />')
                                            .append('<span>' + wardRobeItemName + '</span>')
                                            .append('<span class="edit-extension-icon"></span>')
                                            .append('<span class="item-packed-flag"></span>')
                                            .appendTo($thisBagItem.next(controlSelectors.packItemContainer));
                                        i++;
                                    };
                                    // Track how many matches occured;
                                    itemsAdded.push(wardrobeItemId);
                                }
                            });

                            // Now we can check if there have already occured any matches
                            // Between wardrobe items and items in the bag.
                            // itemsAdded[] is empty if no matching occured and just append new item to the group in the Bag.
                            if ($.inArray(wardrobeItemId, itemsAdded) === -1) {
                                // Create expand arrow button UI for expandable item;
                                if ($thisWardrobeItem.data('expandable').toLowerCase() === 'true') { // TO DO: to bool
                                    // As for now we define expandability on the 'data-expandable' flag in wardrobe item;
                                    $('<span class="section-subitems-expander"><img src="../../Content/images/expand.png" /></span>').appendTo($thisWardrobeItem);
                                }
                                $thisWardrobeItem.append("<span class='item-packed-flag'></span>");
                                $thisWardrobeItem.find(controlSelectors.quantitySpan).empty().text('Qty: ' + (wardrobeItemQuantity));
                                $thisWardrobeItem.data('item-quantity', wardrobeItemQuantity);
                                // Append wardrobe Item to the new Category;
                                $thisWardrobeItem.appendTo($bagGroup);
                                // Create sub item section div
                                var $subitemsSection = $('<div class="section-item-container"></div>').appendTo($bagGroup);
                                var count = 0;
                                while (count < wardrobeItemQuantity) {
                                    $('<div class="section-subitem"></div>')
                                    //.text(wardRobeItemName)
                                        .data('group-id', wardRobeGroupId)
                                        .data('bag-id', wardRobeItemBagId)
                                        .data('name', wardRobeItemName)
                                        .data('item-id', wardrobeItemId)
                                        .data('is-custom-name', isCustomName)
                                        .append('<input class="item-extension" type="text" placeholder="' + wardRobeItemName + '" />')
                                        .append('<span>' + wardRobeItemName + '</span>')
                                        .append('<span class="edit-extension-icon"></span>')
                                        .append('<span class="item-packed-flag"></span>')
                                        .appendTo($subitemsSection);
                                    count++;
                                };

                            }
                        }
                    });
                });
                // Unselect wardrobe items 
                $wardRobeControlElement.packYouBagControl('unselectItems', controlSelectors.packItem);
            }
        },
        // Saves existed bag after some editing applied
        saveCustomBag: function () {
            var $CustomBagItemsCollection = $(controlSelectors.packSubItem, $bagControlElement),
                $buttonElement = $(this);

            // Get selected bag Id
            var selectedBag = $(controlSelectors.bagControl).data('bag-id');

            // Create collection of items data to be saved
            $CustomBagItemsCollection.each(function () {
                var $this = $(this),
                    jsObject = {};

                jsObject['Name'] = $this.data('is-custom-name') ? $this.data('name') : '';

                jsObject['ItemId'] = $this.data('item-id');
                jsObject['GroupId'] = $this.data('group-id');
                jsObject['BagItemId'] = $this.data('bag-id');
                jsObject['IsItemPacked'] = $this.data('is-packed') ? $this.data('is-packed') : false; // TO DO: packed status update after saving bag: data attribute will be always defined;
                saveBagData.push(jsObject);

            });

            // Lock button while ajax is complete
            $buttonElement.attr('disabled', 'disabled');
            $buttonElement.text('Saving...');

            $.ajax({
                url: '/Home/SaveBag',
                type: 'POST',
                contentType: "application/json; charset=utf-8",
                data: "{ 'bagId':" + JSON.stringify(selectedBag) + ",'selectedItems':" + JSON.stringify(saveBagData) + "}",
                success: function (result) {
                    // Clear items array
                    saveBagData.splice(0, saveBagData.length);
                    // Unlock button
                    $buttonElement.removeAttr('disabled');
                    $buttonElement.text('Save bag');

                    //console.log('data received: '+result);
                    controlRefresh(result);

                    $(controlSelectors.bagControl).packYouBagControl('setAllItemsPacked');

                }
            });
        },
        // Saves brand new created bag;
        saveNewBag: function () {
            var $CustomBagItemsCollection = $(controlSelectors.packSubItem, $bagControlElement),
                $buttonElement = $(this),
                newBagName = $(controlSelectors.newBagNameInput).val();

            // Get selected bag Id
            var selectedBag = $(controlSelectors.bagControl).data('bag-id');

            // Create collection of items data to be saved
            $CustomBagItemsCollection.each(function () {
                var $this = $(this),
                    jsObject = {};

                jsObject['Name'] = $this.data('is-custom-name') ? $this.data('name') : '';
                jsObject['ItemId'] = $this.data('item-id');
                jsObject['GroupId'] = $this.data('group-id');
                jsObject['BagItemId'] = $this.data('bag-id');
                jsObject['IsItemPacked'] = $this.data('is-packed') ? $this.data('is-packed') : false;

                saveBagData.push(jsObject);

            });

            var saveData = {};

            saveData.Name = newBagName;
            saveData.seselectedItems = saveBagData;

            // Lock button while ajax is complete
            $buttonElement.attr('disabled', 'disabled');
            $buttonElement.text('Saving...');

            $.ajax({
                url: '/Home/SaveNewBag',
                type: 'POST',
                contentType: "application/json; charset=utf-8",
                //data: JSON.stringify(saveData), //"{ 'Name':" + "'" + newBagName + ", 'selectedItems':" + JSON.stringify(saveBagData) + "}",
                data: "{ 'bagName':" + "'" + newBagName + "', 'selectedItems':" + JSON.stringify(saveBagData) + "}",
                success: function (result) {
                    var index = result.indexOf("<");
                    var newUrl = result;
                    if (index > 0)
                        newUrl = result.substr(0, index);

                    location.href = newUrl;
                    //console.log(result);
                }
            });
        },
        removeSelectedItemsFromBag: function (bagControl) {
            // Remove all selected elements from Bag;
            bagControl.find('.selected').remove();
            // Remove Items Title header its empty
            bagControl.find('.section-item-container').each(function () {
                if ($(this).children().length === 0) {
                    $(this).prev('.section-item').remove();
                    $(this).remove();
                }

            });
            // Remove group title header if its empty
            bagControl.find('.section-container').each(function () {
                if ($(this).children().length === 0) {
                    $(this).prev('.section-header').remove();
                    $(this).remove();
                }
            });
            // Update quantity on Items title bar
            bagControl.find(controlSelectors.packItem).each(function () {
                var itemsLeft = $(this).next(controlSelectors.packItemContainer).children().length;
                $(this).find(controlSelectors.quantitySpan).text('Qty: ' + itemsLeft);
                $(this).data('item-quantity', itemsLeft);
            });
        }
    };

    //## Private functions;
    function controlRefresh(dataModel) {
        // Rerender bagControl template
        $(controlSelectors.bagControl).html($(controlSelectors.bagTemplate).tmpl(dataModel));
    }

    function generateId(prefix) {
        var id = Math.floor(Math.random() * 1001);
        prefix += id;
        return id;
    }
    //##
    obj.PackControl = PackControl;
    return obj;

})(PackYou || {});

$(document).ready(function() {
    // Simply init all stuff;
    PackYou.PackControl.init();
});