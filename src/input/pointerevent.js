var POINTER_INPUT_MAP = {
    pointerdown: INPUT_START,
    pointermove: INPUT_MOVE,
    pointerup: INPUT_END,
    pointercancel: INPUT_CANCEL,
    pointerout: INPUT_CANCEL
};

var IE10_POINTER_TYPE_MAP = {
    2: INPUT_TYPE_TOUCH,
    3: INPUT_TYPE_PEN,
    4: INPUT_TYPE_MOUSE
};

var POINTER_ELEMENT_EVENTS = 'pointerdown pointermove pointerup pointercancel';
var POINTER_WINDOW_EVENTS = 'pointerout';

if(window.MSPointerEvent) {
    POINTER_ELEMENT_EVENTS = 'MSPointerDown MSPointerMove MSPointerUp MSPointerCancel';
    POINTER_WINDOW_EVENTS = 'MSPointerOut';
}

/**
 * Pointer events input
 * @constructor
 */
function PointerEventInput() {
    this._elEvents = POINTER_ELEMENT_EVENTS;
    this._winEvents = POINTER_WINDOW_EVENTS;

    Input.apply(this, arguments);

    this._store = (this.manager.session._pointerEvents = []);
}

inherit(PointerEventInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function(ev) {
        var store = this._store;
        var element = this.manager.element;
        var removePointer = false;

        // normalize event.type
        var evType = ev.type.toLowerCase().replace('ms', '');

        // @todo check mousebutton
        if(evType == 'pointerdown') {
            store.push(ev);
            prefixed(element, 'setPointerCapture', [ev.pointerId]);
        } else if(evType == 'pointerup' || evType == 'pointerout' || evType == 'pointercancel') {
            removePointer = true;
        }

        // get index of the event in the store
        var storeIndex = inArray(store, ev.pointerId, 'pointerId');
        if(storeIndex < 0) {
            // not found, so the pointer hasn't been down (so it's probably a hover)
            return;
        }

        // update the event in the store
        store[storeIndex] = ev;

        var data = {
            pointers: store,
            changedPointers: [ev],
            pointerType: IE10_POINTER_TYPE_MAP[store[0].pointerType] || store[0].pointerType,
            srcEvent: ev
        };

        this.callback(this.manager, POINTER_INPUT_MAP[evType], data);

        if(removePointer) {
            // remove from the store
            store.splice(storeIndex, 1);
            prefixed(element, 'releasePointerCapture', [ev.pointerId]);
        }
    },
});
