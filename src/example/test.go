package main

import (
	"github.com/m-Ryan/vite-plugin-wasm-go/gobridge"
	"syscall/js"
)

func add(this js.Value, p []js.Value) interface {} {
	sum := p[0].Int() + p[1].Int()
	return js.ValueOf(sum)
}

func subtract(this js.Value, p []js.Value) interface {} {
	sum := p[0].Int() - p[1].Int()
	return js.ValueOf(sum)
}

func main() {
	c := make(chan struct{}, 0)
	gobridge.RegisterField("add", js.FuncOf(add))
	gobridge.RegisterField("subtract", js.FuncOf(subtract))
	<-c

}

