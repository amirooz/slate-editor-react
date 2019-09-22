import React, { Component } from 'react'
import { Editor, getEventTransfer } from 'slate-react'
import { Block } from 'slate'
import InitialValue from './InitialValue'
import imageExtensions from 'image-extensions'
import isUrl from 'is-url'
import { css } from 'emotion'
import { isKeyHotkey } from 'is-hotkey'
import { Button, Icon, Toolbar } from './components'

const DEFAULT_NODE = 'paragraph'
const isBoldHotkey = isKeyHotkey('mod+b')
const isItalicHotkey = isKeyHotkey('mod+i')
const isUnderlinedHotkey = isKeyHotkey('mod+u')
const isCodeHotkey = isKeyHotkey('mod+`')
const schema = {
    document: {
      last: { type: 'paragraph' },
      normalize: (editor, { code, node, child }) => {
        switch (code) {
          case 'last_child_type_invalid': {
            const paragraph = Block.create('paragraph')
            return editor.insertNodeByKey(node.key, node.nodes.size, paragraph)
          }
          default:
              return ''
        }
      }
    },
    blocks: {
      image: {
        isVoid: true,
      }
    }
}

class Dashboard extends Component {
    state = {
        value: InitialValue
    }

    hasMark = (type) => {
        const { value } = this.state
        return value.activeMarks.some(mark => mark.type === type)
    }

    hasBlock = (type) => {
        const { value } = this.state
        return value.blocks.some(node => node.type === type)
    }

    ref = (editor) => {
        this.editor = editor
    }

    renderMarkButton = (type, icon) => {
        const isActive = this.hasMark(type)
    
        return (
            <Button
                active={isActive}
                onMouseDown={event => this.onClickMark(event, type)}
            >
                <Icon>{icon}</Icon>
            </Button>
        )
    }

    renderBlockButton = (type, icon) => {
        let isActive = this.hasBlock(type)
    
        if (['numbered-list', 'bulleted-list'].includes(type)) {
            const { value: { document, blocks } } = this.state
        
            if (blocks.size > 0) {
                const parent = document.getParent(blocks.first().key)
                isActive = this.hasBlock('list-item') && parent && parent.type === type
            }
        }
    
        return (
            <Button
                active={isActive}
                onMouseDown={event => this.onClickBlock(event, type)}
            >
                <Icon>{icon}</Icon>
            </Button>
        )
    }

    renderBlock = (props, editor, next) => {
        const { attributes, children, node } = props
    
        switch (node.type) {
            case 'block-quote':
                return <blockquote {...attributes}>{children}</blockquote>
            case 'bulleted-list':
                return <ul {...attributes}>{children}</ul>
            case 'heading-one':
                return <h1 {...attributes}>{children}</h1>
            case 'heading-two':
                return <h2 {...attributes}>{children}</h2>
            case 'list-item':
                return <li {...attributes}>{children}</li>
            case 'numbered-list':
                return <ol {...attributes}>{children}</ol>
            case 'image': {
                const src = node.data.get('src')
                return (
                    <img
                    {...attributes}
                    src={src}
                    alt={src}
                    className={css`
                        display: block;
                        max-width: 100%;
                        max-height: 20em;
                        box-shadow: ${this.isFocused ? '0 0 0 2px blue;' : 'none'};
                    `}
                    />
                )
            }
            case 'file': {
                const src = node.data.get('src')
                return (
                    <img
                    {...attributes}
                    src={src}
                    alt={src}
                    className={css`
                        display: block;
                        max-width: 100%;
                        max-height: 20em;
                        box-shadow: ${this.isFocused ? '0 0 0 2px blue;' : 'none'};
                    `}
                    />
                )
            }
            default:
                return next()
        }
    }

    renderMark = (props, editor, next) => {
        const { children, mark, attributes } = props
    
        switch (mark.type) {
            case 'bold':
                return <strong {...attributes}>{children}</strong>
            case 'code':
                return <code {...attributes}>{children}</code>
            case 'italic':
                return <em {...attributes}>{children}</em>
            case 'underlined':
                return <u {...attributes}>{children}</u>
            default:
                return next()
        }
    }

    onChange = ({ value }) => {
        if (value.document !== this.state.value.document) {
            const content = JSON.stringify(value.toJSON())
            localStorage.setItem('content', content)
        }
        this.setState({ value })
    }

    onKeyDown = (event, editor, next) => {
        let mark
    
        if (isBoldHotkey(event)) {
            mark = 'bold'
        } else if (isItalicHotkey(event)) {
            mark = 'italic'
        } else if (isUnderlinedHotkey(event)) {
            mark = 'underlined'
        } else if (isCodeHotkey(event)) {
            mark = 'code'
        } else {
            return next()
        }
    
        event.preventDefault()
        editor.toggleMark(mark)
    }

    onClickMark = (event, type) => {
        event.preventDefault()
        this.editor.toggleMark(type)
    }

    onClickBlock = (event, type) => {
        event.preventDefault()
    
        const { editor } = this
        const { value } = editor
        const { document } = value
    
        // Handle everything but list buttons.
        if (type !== 'bulleted-list' && type !== 'numbered-list') {
          const isActive = this.hasBlock(type)
          const isList = this.hasBlock('list-item')
    
            if (isList) {
                editor
                .setBlocks(isActive ? DEFAULT_NODE : type)
                .unwrapBlock('bulleted-list')
                .unwrapBlock('numbered-list')
            } else {
                editor.setBlocks(isActive ? DEFAULT_NODE : type)
            }
        } else {
            // Handle the extra wrapping required for list buttons.
            const isList = this.hasBlock('list-item')
            const isType = value.blocks.some(block => {
                return !!document.getClosest(block.key, parent => parent.type === type)
            })
        
            if (isList && isType) {
                editor
                .setBlocks(DEFAULT_NODE)
                .unwrapBlock('bulleted-list')
                .unwrapBlock('numbered-list')
            } else if (isList) {
                editor
                .unwrapBlock(
                    type === 'bulleted-list' ? 'numbered-list' : 'bulleted-list'
                )
                .wrapBlock(type)
            } else {
                editor.setBlocks('list-item').wrapBlock(type)
            }
        }
    }
  
    isImage = (url) => {
        return imageExtensions.includes(this.getExtension(url))
    }

    getExtension = (url) => {
        return new URL(url).pathname.split('.').pop()
    }

    insertImage = (editor, src, target) => {
        if (target) {
            editor.select(target)
        }
      
        editor.insertBlock({
          type: 'image',
          data: { src },
        })
        console.log(2)
    }

    onClickImage = event => {
        event.preventDefault()
        const src = window.prompt('Enter the URL of the image:')
        if (!src) return
        console.log(src);
        this.editor.command(this.insertImage, src)
    }

    onDropOrPaste = (event, editor, next) => {
        const target = editor.findEventRange(event)
        if (!target && event.type === 'drop') return next()
    
        const transfer = getEventTransfer(event)
        const { type, text, files } = transfer
    
        if (type === 'files') {
            for (const file of files) {
                const reader = new FileReader()
                const [mime] = file.type.split('/')
                if (mime !== 'image') continue
        
                reader.addEventListener('load', () => {
                    editor.command(this.insertImage, reader.result, target)
                })
        
                reader.readAsDataURL(file)
            }
            return
        }
    
        if (type === 'text') {
            if (!isUrl(text)) return next()
            if (!this.isImage(text)) return next()
            editor.command(this.insertImage, text, target)
            return
        }
    
        next()
    }

    onClickFile = (event) => {
        event.preventDefault()
        const fileSelector = document.createElement('input')
        fileSelector.setAttribute('type', 'file')
        fileSelector.setAttribute('name', 'file')
        // fileSelector.setAttribute('multiple', 'multiple')
        fileSelector.setAttribute('accept', '.pdf, .txt')
        fileSelector.click()
        // return fileSelector
        if (!fileSelector) return
        const src = fileSelector
        console.log(src);
        this.editor.command(this.insertFile, src)
    }

    insertFile = (editor, src, target) => {
        if (target) {
          editor.select(target)
        }
      
        editor.insertBlock({
          type: 'file',
          data: { src },
        })
    }

    render() {
        return (
            <div className="dashboard">
                <Toolbar>
                    {this.renderMarkButton('bold', 'format_bold')}
                    {this.renderMarkButton('italic', 'format_italic')}
                    {this.renderMarkButton('underlined', 'format_underlined')}
                    {this.renderMarkButton('code', 'code')}
                    {this.renderBlockButton('heading-one', 'looks_one')}
                    {this.renderBlockButton('heading-two', 'looks_two')}
                    {this.renderBlockButton('block-quote', 'format_quote')}
                    {this.renderBlockButton('numbered-list', 'format_list_numbered')}
                    {this.renderBlockButton('bulleted-list', 'format_list_bulleted')}
                    <Button onMouseDown={this.onClickImage}>
                        <Icon>image</Icon>
                    </Button>
                    <Button onMouseDown={this.onClickFile}>
                        <Icon>attach_file</Icon>
                    </Button>
                </Toolbar>
                <Editor
                    spellCheck
                    autoFocus
                    placeholder="Enter some rich text..."
                    ref={this.ref}
                    value={this.state.value}
                    schema={schema}
                    onChange={this.onChange}
                    onKeyDown={this.onKeyDown}
                    onDrop={this.onDropOrPaste}
                    onPaste={this.onDropOrPaste}
                    renderMark={this.renderMark}
                    renderBlock={this.renderBlock}
                />
            </div>
        )
    }
}

export default Dashboard
