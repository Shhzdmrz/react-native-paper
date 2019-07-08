import * as React from 'react';
import {
  StyleProp,
  StyleSheet,
  Animated,
  SafeAreaView,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';
import color from 'color';
import FAB from './FAB';
import Text from '../Typography/Text';
import Card from '../Card/Card';
import { withTheme } from '../../core/theming';
import { Theme } from '../../types';
import { IconSource } from '../Icon';

type Props = React.ComponentProps<typeof View> & {
  /**
   * Icon to display for the `FAB`.
   * You can toggle it based on whether the speed dial is open to display a different icon.
   */
  icon: IconSource;
  /**
   * Accessibility label for the FAB. This is read by the screen reader when the user taps the FAB.
   */
  accessibilityLabel?: string;
  /**
   * Custom color for the `FAB`.
   */
  color?: string;
  /**
   * Function to execute on pressing the `FAB`.
   */
  onPress?: () => void;
  /**
   * Whether the speed dial is open.
   */
  open: boolean;
  /**
   * Callback which is called on opening and closing the speed dial.
   * The open state needs to be updated when it's called, otherwise the change is dropped.
   */
  onStateChange: (state: { open: boolean }) => void;
  /**
   * Whether `FAB` is currently visible.
   */
  visible: boolean;
  /**
   * Content of the `FABGroup`.
   */
  children: React.ReactNode;
  /**
   * Style for the group. You can use it to pass additional styles if you need.
   * For example, you can set an additional padding if you have a tab bar at the bottom.
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Style for the FAB. It allows to pass the FAB button styles, such as backgroundColor.
   */
  fabStyle?: StyleProp<ViewStyle>;
  /**
   * @optional
   */
  theme: Theme;
};

type State = {
  backdrop: Animated.Value;
  animations: Animated.Value[];
};

/**
 * A component to display a stack of FABs with related actions in a speed dial.
 * To render the group above other components, you'll need to wrap it with the [`Portal`](portal.html) component.
 *
 * <div class="screenshots">
 *   <img src="screenshots/fab-group.png" />
 * </div>
 *
 * ## Usage
 * ```js
 * import * as React from 'react';
 * import { FAB, Portal, Provider } from 'react-native-paper';
 *
 * export default class MyComponent extends React.Component {
 *   state = {
 *     open: false,
 *   };
 *
 *   render() {
 *     return (
 *       <Provider>
 *          <Portal>
 *            <FAB.Group
 *              open={this.state.open}
 *              icon={this.state.open ? 'today' : 'add'}
 *              onStateChange={({ open }) => this.setState({ open })}
 *              onPress={() => {
 *                if (this.state.open) {
 *                  // do something if the speed dial is open
 *                }
 *              }}
 *            />
 *            <FAB
 *              small
 *              icon="add"
 *              onPress={() => console.log('Pressed add')}
 *             />
 *             <FAB
 *              small
 *              icon="star"
 *              label="Star"
 *              onPress={() => console.log('Pressed star')}
 *             />
 *             <FAB
 *              small
 *              icon="email"
 *              label="Email"
 *              onPress={() => console.log('Pressed email')}
 *             />
 *             <FAB
 *              small
 *              icon="notifications"
 *              label="Remind"
 *              onPress={() => console.log('Pressed notifications')}
 *             />
 *            </FAB.Group>
 *          </Portal>
 *       </Provider>
 *     );
 *   }
 * }
 * ```
 */
class FABGroup extends React.Component<Props, State> {
  static displayName = 'FAB.Group';

  static getDerivedStateFromProps(nextProps: Props, prevState: State) {
    return {
      animations: React.Children.map(
        nextProps.children,
        (_, i) =>
          prevState.animations[i] || new Animated.Value(nextProps.open ? 1 : 0)
      ),
    };
  }

  state: State = {
    backdrop: new Animated.Value(0),
    animations: [],
  };

  componentDidUpdate(prevProps: Props) {
    if (this.props.open === prevProps.open) {
      return;
    }

    if (this.props.open) {
      Animated.parallel([
        Animated.timing(this.state.backdrop, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.stagger(
          50,
          this.state.animations
            .map(animation =>
              Animated.timing(animation, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
              })
            )
            .reverse()
        ),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(this.state.backdrop, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        ...this.state.animations.map(animation =>
          Animated.timing(animation, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          })
        ),
      ]).start();
    }
  }

  _close = () => this.props.onStateChange({ open: false });

  _toggle = () => this.props.onStateChange({ open: !this.props.open });

  render() {
    const {
      icon,
      open,
      onPress,
      accessibilityLabel,
      theme,
      style,
      fabStyle,
      visible,
      children,
    } = this.props;
    const { colors } = theme;

    const labelColor = theme.dark
      ? colors.text
      : color(colors.text)
          .fade(0.54)
          .rgb()
          .string();
    const backdropOpacity = open
      ? this.state.backdrop.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 1, 1],
        })
      : this.state.backdrop;

    const opacities = this.state.animations;
    const scales = opacities.map(opacity =>
      open
        ? opacity.interpolate({
            inputRange: [0, 1],
            outputRange: [0.8, 1],
          })
        : 1
    );

    return (
      <View pointerEvents="box-none" style={[styles.container, style]}>
        <TouchableWithoutFeedback onPress={this._close}>
          <Animated.View
            pointerEvents={open ? 'auto' : 'none'}
            style={[
              styles.backdrop,
              {
                opacity: backdropOpacity,
                backgroundColor: colors.backdrop,
              },
            ]}
          />
        </TouchableWithoutFeedback>
        <SafeAreaView pointerEvents="box-none" style={styles.safeArea}>
          <View pointerEvents={open ? 'box-none' : 'none'}>
            {React.Children.map(children, (child, i) => (
              <View
                key={i} // eslint-disable-line react/no-array-index-key
                style={styles.item}
                pointerEvents="box-none"
              >
                {React.isValidElement(child) && child.props.label && (
                  <Card
                    style={
                      [
                        styles.label,
                        {
                          transform: [{ scale: scales[i] }],
                          opacity: opacities[i],
                        },
                      ] as StyleProp<ViewStyle>
                    }
                    onPress={() => {
                      child.props.onPress();
                      this._close();
                    }}
                    accessibilityLabel={
                      child.props.accessibilityLabel !== 'undefined'
                        ? child.props.accessibilityLabel
                        : child.props.label
                    }
                    accessibilityTraits="button"
                    accessibilityComponentType="button"
                    accessibilityRole="button"
                  >
                    <Text style={{ color: labelColor }}>
                      {child.props.label}
                    </Text>
                  </Card>
                )}
                {React.isValidElement(child) &&
                  React.cloneElement(child, {
                    label: null,
                    style: [
                      {
                        transform: [{ scale: scales[i] }],
                        opacity: opacities[i],
                        backgroundColor: theme.colors.surface,
                      },
                      child.props.style,
                    ] as StyleProp<ViewStyle>,
                    onPress: () => {
                      child.props.onPress();
                      this._close();
                    },
                    accessibilityLabel:
                      typeof child.props.accessibilityLabel !== 'undefined'
                        ? child.props.accessibilityLabel
                        : child.props.label,
                    accessibilityTraits: 'button',
                    accessibilityComponentType: 'button',
                    accessibilityRole: 'button',
                  })}
              </View>
            ))}
          </View>
          <FAB
            onPress={() => {
              onPress && onPress();
              this._toggle();
            }}
            icon={icon}
            color={this.props.color}
            accessibilityLabel={accessibilityLabel}
            accessibilityTraits="button"
            accessibilityComponentType="button"
            accessibilityRole="button"
            style={[styles.fab, fabStyle]}
            visible={visible}
          />
        </SafeAreaView>
      </View>
    );
  }
}

export default withTheme(FABGroup);

// @component-docs ignore-next-line
export { FABGroup };

const styles = StyleSheet.create({
  safeArea: {
    alignItems: 'flex-end',
  },
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  fab: {
    marginHorizontal: 16,
    marginBottom: 16,
    marginTop: 0,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  label: {
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 2,
  },
  item: {
    marginHorizontal: 24,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});
