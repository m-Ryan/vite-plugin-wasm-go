package gobridge

import (
	"syscall/js"
)

const BRIDGE_NAME = "__GO_BRIDGE__"

func GetBridgeObj() js.Value {
	var obj = js.Global().Get(BRIDGE_NAME)
	if js.Undefined().Equal(obj) {
		js.Global().Set(BRIDGE_NAME, js.ValueOf(map[string]interface{}{}))
		return js.Global().Get(BRIDGE_NAME)
	}
	return obj
}

func RegisterField(name string, value interface{}) {
	GetBridgeObj().Set(name, value)
}
