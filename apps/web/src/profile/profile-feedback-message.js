(function registerProfileFeedbackMessage(global) {
  const namespace = global.OdontoFlowProfileBlocks = global.OdontoFlowProfileBlocks || {};

  namespace.createProfileFeedbackMessage = () => ({ message = '', status = 'idle' }) => (
    message ? (
      <p className={`text-xs ${status === 'error' ? 'text-rose-600' : 'text-slate-600'}`}>
        {message}
      </p>
    ) : null
  );
}(globalThis));
