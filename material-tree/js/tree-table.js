
(function ($) {

    $.fn.tableTree = function (options) {

        // Establish our default settings
        var state = [];
        var parent = this["0"];
        var currentSelectedRow = -1;
        var settings = $.extend({
            iconTheme: "arrow",
            margin: "small", //In Percentage
            data: [],
            colorTheme: "sky", // sky, grass, water, light, dark, white
            isAlternateRowEffect : false,
            attachKeyboadEvent: true,
            font: "large",
            padding: "small",
            pointed: false,
            layered: true,
            labelIconTheme: "file"
        }, options);

        iconTheme = {
            math: {
                openIcon: "remove",
                closeIcon: "add"
            },
            keyboard: {
                openIcon: "keyboard_arrow_down",
                closeIcon: "keyboard_arrow_right"
            },
            arrow: {
                openIcon: "arrow_downward",
                closeIcon: "arrow_forward"
            },
            triangle: {
                openIcon: "arrow_drop_down",
                closeIcon: "arrow_right"
            },
            lock: {
                openIcon: "lock_open",
                closeIcon: "lock"
            }
        }

        labelIconTheme = {
            file: {
                rootIcon: "folder",
                parentIcon: "folder",
                leafIcon: "insert_drive_file"
            }
        }

        var margin = {
            small: 2,
            medium: 5,
            large: 8
        }

        var padding = {
            no: "0%",
            small: "1%",
            medium: "2%",
            large: "5%",
        }
        var fontSize = {
            small: "small-font",
            medium: "medium-font",
            large: "large-font"
        }

        function createRow(data, level) {
            if (data == null) return;
            data.forEach(function (arrayItem) {
                level == 0 ? arrayItem.status = 1 : arrayItem.status = 0;
                let lev = level;
                let haveChild = arrayItem.children ? true : false;
                createLabel(arrayItem["label"], level, haveChild, null);
                createRow(arrayItem.children, ++lev);
            });
        }

        function toggleChild(event) {
            let parentElm = event.currentTarget.parentElement;
            let state = parentElm.getAttribute("data-state");
            let icon = event.currentTarget;
            let index = parentElm.getAttribute("data-position");
            if (state && state == "open") {
                parentElm.setAttribute("data-state", "close");
                closeChild(index, icon);
            } else {
                parentElm.setAttribute("data-state", "open");
                openChild(index, icon);
            }
        }

        function openChild(index, icon) {
            let level = state[index].level;
            let run = true;
            let tIndex = parseInt(index) + 1;
            while (run) {
                if (!state[tIndex]) break;
                let object = state[tIndex].object;
                let level1 = state[tIndex].level;
                run = false;
                if (level1 == level + 1) {
                    object.classList.remove("tree-close");
                    if (object.getAttribute("data-state") == "open") {
                        openChild(tIndex, object.children[0]);
                    }
                    run = true;
                } else if (level1 != level) {
                    run = true;
                }
                tIndex++;
            }
            icon.innerText = iconTheme[settings.iconTheme].openIcon;
        }

        function closeChild(index, icon) {
            let level = state[index].level;
            let run = true;
            let tIndex = parseInt(index) + 1;
            while (run) {
                if (state[tIndex]) {
                    let object = state[tIndex].object;
                    let level1 = state[tIndex].level;
                    if (level1 > level) {
                        object.classList.add("tree-close");
                    } else {
                        run = false;
                    }
                } else {
                    run = false;
                }
                tIndex++;
            }
            icon.innerText = iconTheme[settings.iconTheme].closeIcon;
        }

        function createIcon(data) {
            let temp = document.createElement("i");
            temp.innerText = iconTheme[settings.iconTheme].openIcon;
            temp.classList.add("material-icons");
            temp.addEventListener("click", toggleChild);
            return temp;
        }

        function createLabel(data, level, haveChild, style) {
            let temp = document.createElement("div");
            temp.classList.add("tree-table-item");
            temp.classList.add("visible");
            temp.setAttribute("data-position", state.length);
            let spanElm = document.createElement("span");
            spanElm.innerText = data;
            if (haveChild) {
                let iconElm = createIcon();
                // iconElm.setAttribute("data-position",state.length );
                temp.appendChild(iconElm);
                temp.setAttribute("data-state", "open");
            }
            temp.appendChild(spanElm);
            state.push({ object: temp, level: level });
            temp.addEventListener("dblclick", onEdit);
            // temp.addEventListener("mouseout", removeEditButton);
            temp.addEventListener("click", clickHandler);

            let padding = (level * margin[settings.margin]);
            temp.style.paddingLeft = padding + "%";
            parent.appendChild(temp);
        }
        function clickHandler(event) {
            var position = event.currentTarget.getAttribute("data-position");
            if (currentSelectedRow != -1) {
                state[currentSelectedRow].object.classList.remove("select");
            }
            state[position].object.classList.add("select");
            currentSelectedRow = position;
        }

        function onEdit(event) {
            let tar = event.currentTarget;
            if (tar.children.length > 2) return;
            let index = tar.children.length == 2 ? 1 : 0;
            tar.children[index].style.display = "none";
            let text = tar.children[index].innerText;
            let obj = document.createElement("input");
            obj.setAttribute("type", "text");
            obj.setAttribute("value", text);
            tar.appendChild(obj);
            let temp = document.createElement("i");
            temp.innerText = "save";
            temp.classList.add("material-icons");
            temp.style.marginLeft = "5px";
            temp.addEventListener("click", onSave);
            tar.appendChild(temp);
            obj.focus();
            obj.addEventListener("keyup", function (event) {
                if (event.key == "Enter") {
                    onSave(event);
                }
            }, false);
        }

        function onSave(event) {
            let parentRow = event.target.parentElement;
            if (parentRow.children.length == 4) {
                parentRow.children[1].innerText = parentRow.children[2].value;
                parentRow.children[1].style.display = "";
                parentRow.removeChild(parentRow.children[3]);
                parentRow.removeChild(parentRow.children[2]);
            } else {
                parentRow.children[0].innerText = parentRow.children[1].value;
                parentRow.children[0].style.display = "";
                parentRow.removeChild(parentRow.children[2]);
                parentRow.removeChild(parentRow.children[1]);
            }
            parentRow.parentElement.focus();
        }

        function keyHandler(event) {
            const keyName = event.key;
            //console.log(keyName);
            currentSelectedRow != -1 ? state[currentSelectedRow].object.classList.remove("select") : "";
            if (keyName === 'ArrowDown' || keyName === 'ArrowRight') {
                if (currentSelectedRow == -1 || currentSelectedRow == state.length - 1) {
                    currentSelectedRow = 0;
                } else {
                    currentSelectedRow++;
                }
            } else if (keyName === 'ArrowUp' || keyName === 'ArrowLeft') {
                if (currentSelectedRow == -1 || currentSelectedRow == 0) {
                    currentSelectedRow = state.length - 1;
                } else {
                    currentSelectedRow--;
                }
            } 
            state[currentSelectedRow].object.classList.add("select");
        }
        parent.innerHTML = "";
        parent.classList.add("tree-table");
        parent.classList.add(settings.colorTheme);
        parent.classList.add(fontSize[settings.font]);
        settings.isAlternateRowEffect ? parent.classList.add("alternate") : "";
        parent.style.margin = padding[settings.padding];
        parent.style.padding = padding[settings.padding];
        if (!settings.pointed) {
            parent.style.borderRadius = padding[settings.padding];
        }
        if (settings.layered === true) {
            parent.classList.add("tree-layered");
        }
        createRow(settings.data, 0);
        parent.addEventListener("keyup", keyHandler, false);
        parent.setAttribute("tabindex", 0);

        parent.getData = function () {
            let obj = [];
            for (let i = 0; i < state.length; i++) {
                //console.log(state[i]);
                if (state[i].level == 0) {
                    let temp = {};
                    temp.label = state[i].object.children.length > 1 ? state[i].object.children[1].innerText : state[i].object.children[0].innerText;
                    temp.icon = null;
                    //temp.state = state[i].state;
                    temp.children = getChildNodes(i);
                    obj.push(temp);
                }
            }
            return obj;
        };

        function getChildNodes(index) {
            if (index == state.length) return [];
            let childIndex = index + 1;
            let nodes = [];
            while ((state[index].level + 1) == state[childIndex].level) {
                let temp = {};
                temp.label = state[childIndex].object.children.length > 1 ? state[childIndex].object.children[1].innerText : state[childIndex].object.children[0].innerText;
                temp.icon = null;
                //temp.state = state[index].state;
                temp.children = getChildNodes(childIndex);
                nodes.push(temp);
                childIndex++;
            }
            return nodes;
        }
    };

}(jQuery));