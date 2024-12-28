from livereload import Server, shell

server = Server()

# Watch the current directory for changes
server.watch('.', shell('python3 -m http.server 8000'))

# Start the server
server.serve(root='.', port=8000, open_url_delay=1)