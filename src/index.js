import { Plugin } from "prosemirror-state"

export function imageDropHandler(schema, url) {
  let plugin = new Plugin({
    props: {
      handleDOMEvents: {
        drop: (view, event) => {
          let files = event.dataTransfer.files
          let sel = view.state.tr.curSelection
          if (files.length == 0) {
            return
          }

          if (event.preventDefault != undefined) {
            event.preventDefault()
          } else {
            window.event.returnValue = false
          }

          ([...files[0]]).forEach((file, i, filelist) => {
            console.log('drop', file)
            if (
              file.type != 'image/svg+xml' &&
              file.type != 'image/png' &&
              file.type != 'image/jpeg' &&
              file.type != 'image/gif'
            ) {
              console.log('not image', file.type)
              return
            }
            let formData = new FormData()
            formData.append('file', file)
            var x = new XMLHttpRequest()
            x.open('POST', url)
            x.onload = function (ret) {
              if (x.readyState == 4 && x.status == 200) {
                let pos = view.posAtCoords({ left: event.clientX, top: event.clientY })
                view.dispatch(
                  view.state.tr.replaceWith(pos.pos, pos.pos,
                    schema.nodes.image.create({
                      src: x.responseText
                    }
                    )
                  ).scrollIntoView())
              }
            }
            x.send(formData)
          })
        }
      }
    }
  })
  return plugin
}
