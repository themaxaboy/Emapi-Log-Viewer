export default ({ text = "This is the default footer" }) => (
  <footer className="toolbar toolbar-footer">
    <h1 className="title">{text}</h1>
  </footer>
);