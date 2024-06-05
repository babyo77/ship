import { endpoint } from '../api/api'
import { io } from 'socket.io-client'

const socket = io(endpoint)

export default socket
