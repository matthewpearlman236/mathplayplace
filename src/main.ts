import './style.css'
import { mountApp } from './shell.ts'

const root = document.querySelector<HTMLDivElement>('#app')
if (!root) throw new Error('Missing #app')
mountApp(root)
