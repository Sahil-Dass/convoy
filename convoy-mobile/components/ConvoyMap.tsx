import React, { forwardRef } from 'react';
import Implementation from './ConvoyMapImplementation';

// This wrapper forwards all props and refs to the platform-specific implementation
const ConvoyMap = forwardRef((props: any, ref) => {
  return <Implementation {...props} ref={ref} />;
});

export default ConvoyMap;
