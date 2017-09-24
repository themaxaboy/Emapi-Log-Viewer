export default ({ text = "This is the default footer" }) => (
  <header className="toolbar toolbar-header">
    <div className="toolbar-actions">
      <div className="btn-group">
        <button className="btn btn-default">
          <span className="icon icon-home" />
        </button>
        <button className="btn btn-default">
          <span className="icon icon-home icon-text" />
          Filters
        </button>
      </div>

      <button className="btn btn-default btn-dropdown pull-right">
        <span className="icon icon-megaphone" />
      </button>
    </div>
  </header>
);
