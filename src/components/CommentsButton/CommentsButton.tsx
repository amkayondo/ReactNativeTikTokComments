import React from 'react';
import * as RN from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedProps,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  scrollTo,
  useDerivedValue,
  withSpring,
} from 'react-native-reanimated';

import { HomeIcon } from '../SVG/HomeIcon';

const { width, height } = RN.Dimensions.get('screen');

const springConfig: Animated.WithSpringConfig = {
  velocity: 8,
  damping: 80,
  stiffness: 300,
};

const BOTTOM_MIN = -(height * 2);
const BOTTOM_MAX = 0;

export const CommentsButton = () => {
  const { isOpen, toggleComments, setIsOpen } = useCommentsButton();

  const animRef = useAnimatedRef<Animated.ScrollView>();

  const bottom = useSharedValue(BOTTOM_MIN);

  const contentHeight = useSharedValue(0);
  const scrollOffset = useSharedValue(0);
  const onEndDragged = useSharedValue(0);
  const animLock = useSharedValue(0);

  const closeAnim = () => {
    animLock.value = 1;
    bottom.value = withSpring(BOTTOM_MIN, springConfig, () => {
      setIsOpen(false);
      animLock.value = 0;
    });
  };

  const openAnim = () => {
    animLock.value = 1;
    bottom.value = withSpring(BOTTOM_MAX, springConfig, () => {
      setIsOpen(true);
      animLock.value = 0;
    });
  };

  const handleDragEndEvent = () => {
    if (bottom.value > BOTTOM_MAX - 250) {
      openAnim();
    } else {
      closeAnim();
    }
  };

  const gestureHandler = useAnimatedGestureHandler({
    onActive: (evt, ctx: { originY: number }) => {
      let diff = evt.y - ctx.originY;

      // console.warn(diff);

      if (scrollOffset.value < 1 && evt.velocityY > 0) {
        diff *= 1.5;

        bottom.value = bottom.value - diff;
      } else {
        // scrollOffset.value = (scrollOffset.value + (-1 * evt.translationY / 10)) % contentHeight.value;
        // scrollOffset.value =
        //  (scrollOffset.value - diff) % contentHeight.value;
        scrollOffset.value = (-1 * evt.translationY) % contentHeight.value;
        return;
      }
    },
    onEnd: (evt, ctx) => {
      handleDragEndEvent();
    },
    onStart: (evt, ctx) => {
      ctx.originY = evt.y;
    },
  });

  // const scrollHandler = useAnimatedScrollHandler({
  //   onScroll: (event) => {
  //     if (animLock.value === 1) {
  //       return;
  //     }

  //     if (event.contentOffset.y <= 0) {
  //       bottom.value = bottom.value + event.contentOffset.y / 2;
  //       return;
  //     }

  //     scrollOffset.value = event.contentOffset.y;
  //   },
  //   onEndDrag: (evt) => {
  //     if (animLock.value === 1) {
  //       return;
  //     }

  //     handleDragEndEvent();
  //   },
  // });

  const animStyle = useAnimatedStyle(() => {
    return {
      bottom: bottom.value,
    };
  });

  // const animProps = useAnimatedProps(() => {
  //   return {
  //     pointerEvents: onEndDragged.value === 1 ? 'box-only' : 'box-none',
  //   };
  // });

  useDerivedValue(() => {
    scrollTo(animRef, 0, scrollOffset.value, false);
  });

  return (
    <>
      <RN.TouchableOpacity
        onPress={() => {
          if (isOpen) {
            closeAnim();
          } else {
            openAnim();
          }

          toggleComments();
        }}>
        <HomeIcon />
      </RN.TouchableOpacity>

      <Animated.View style={[styles.box, animStyle]}>
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.ScrollView
            ref={animRef}
            onContentSizeChange={(w, h) => (contentHeight.value = h)}
            scrollEnabled={false}
            // animatedProps={animProps}
            scrollEventThrottle={16}
            // alwaysBounceVertical={true}
            // bounces={false}
            // onScroll={scrollHandler}
          >
            {Array.from({ length: 50 }).map((_, i) => (
              <RN.Text>test{i}</RN.Text>
            ))}
          </Animated.ScrollView>
        </PanGestureHandler>
      </Animated.View>
    </>
  );
};

const styles = RN.StyleSheet.create({
  box: {
    position: 'absolute',
    left: 0,
    width,
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
    padding: 8,
    backgroundColor: 'grey',
    height: height * 0.65,
    zIndex: 1000,
  },
});

export const useCommentsButton = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleComments = () => {
    setIsOpen(!isOpen);
  };

  return { isOpen, toggleComments, setIsOpen };
};
