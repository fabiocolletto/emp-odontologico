(function registerAuthEntryNotices(global) {
  const namespace = global.OdontoFlowAuthEntry = global.OdontoFlowAuthEntry || {};

  namespace.AuthEntryNotices = ({ authMessage, authError, onCloseNotices }) => (
    <>
      <TransientNotice
        visible={Boolean(authMessage)}
        tone="success"
        message={authMessage}
        onClose={onCloseNotices}
      />
      <TransientNotice
        visible={Boolean(authError)}
        tone="error"
        message={authError}
        onClose={onCloseNotices}
      />
    </>
  );
}(globalThis));
