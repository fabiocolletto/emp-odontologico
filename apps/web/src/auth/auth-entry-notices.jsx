(function registerAuthEntryNotices(global) {
  const namespace = global.OdontoFlowAuthEntry = global.OdontoFlowAuthEntry || {};

  const InlineNotice = ({ visible, tone, message, onClose }) => {
    if (!visible) return null;
    return (
      <div className={`transient-notice transient-notice--${tone}`}>
        <div className="transient-notice__content">
          <span>{message}</span>
        </div>
        <button
          type="button"
          className="btn btn--ghost transient-notice__close"
          onClick={onClose}
          aria-label="Fechar aviso"
        >
          OK
        </button>
      </div>
    );
  };

  namespace.AuthEntryNotices = ({ authMessage, authError, onCloseNotices }) => (
    <>
      <InlineNotice
        visible={Boolean(authMessage)}
        tone="success"
        message={authMessage}
        onClose={onCloseNotices}
      />
      <InlineNotice
        visible={Boolean(authError)}
        tone="error"
        message={authError}
        onClose={onCloseNotices}
      />
    </>
  );
}(globalThis));
