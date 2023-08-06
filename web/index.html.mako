<!DOCTYPE html>
<html>

<% with open("web/importmap.json") as f: importmap=f.read() %>
    <title>Pyggy</title>

    <head>
        <title>Pyggy</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="stylesheet" href="./index.css" />
        <script type="importmap">
        % for line in importmap.splitlines():
        ${line}
        % endfor
        </script>
    </head>

    <body>
        <div id="slider"></div>
        <div id="slider2"></div>
        % for i in range(100):
        <br />.
        % endfor
        <script type="module" src="./index.js"></script>
    </body>

</html>