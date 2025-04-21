export const fadeIn = (direction = 'up', type = 'spring', delay = 0, duration = 1) => {
    return {
      initial: {
        y: direction === 'up' ? 100 : direction === 'down' ? -100 : 0,
        opacity: 0,
      },
      animate: {
        y: 0,
        opacity: 1,
        transition: {
          type: type,
          delay: delay,
          duration: duration,
        },
      },
    };
  };
  
  export const textVariant = () => {
    return {
      initial: {
        y: 50,
        opacity: 0,
      },
      animate: {
        y: 0,
        opacity: 1,
        transition: {
          type: 'spring',
          delay: 0.2,
          duration: 0.75,
        },
      },
    };
  };