import * as React from 'react';
import color from 'color';
import {
  Animated,
  StyleSheet,
  StyleProp,
  TextStyle,
  LayoutChangeEvent,
} from 'react-native';
import AnimatedText from './Typography/AnimatedText';
import { withTheme } from '../core/theming';
import { Theme, $Omit } from '../types';

type Props = $Omit<
  $Omit<React.ComponentProps<typeof Animated.Text>, 'padding'>,
  'type'
> & {
  /**
   * Type of the helper text.
   */
  type: 'error' | 'info';
  /**
   * Whether to display the helper text.
   */
  visible?: boolean;
  /**
   * Whether to apply padding to the helper text.
   */
  padding?: 'none' | 'normal';
  /**
   * Text content of the HelperText.
   */
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  /**
   * @optional
   */
  theme: Theme;
  /**
   * TestID used for testing purposes
   */
  testID?: string;
};

type State = {
  shown: Animated.Value;
  textHeight: number;
};

/**
 * Helper text is used in conjuction with input elements to provide additional hints for the user.
 *
 * <div class="screenshots">
 *   <img class="medium" src="screenshots/helper-text.gif" />
 * </div>
 *
 * ## Usage
 * ```js
 * import * as React from 'react';
 * import { View } from 'react-native';
 * import { HelperText, TextInput } from 'react-native-paper';
 *
 * export default class MyComponent extends React.Component {
 *   state = {
 *     text: ''
 *   };
 *
 *   render(){
 *     return (
 *       <View>
 *         <TextInput
 *           label="Email"
 *           value={this.state.text}
 *           onChangeText={text => this.setState({ text })}
 *         />
 *         <HelperText
 *           type="error"
 *           visible={!this.state.text.includes('@')}
 *         >
 *           Email address is invalid!
 *         </HelperText>
 *       </View>
 *     );
 *   }
 * }
 * ```
 */
class HelperText extends React.PureComponent<Props, State> {
  static defaultProps: Partial<Props> = {
    type: 'info',
    padding: 'normal',
    visible: true,
  };

  state = {
    shown: new Animated.Value(this.props.visible ? 1 : 0),
    textHeight: 0,
  };

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (
      prevProps.visible !== this.props.visible ||
      prevState.textHeight !== this.state.textHeight
    ) {
      if (this.props.visible) {
        this._showText();
      } else {
        this._hideText();
      }
    }
  }

  _showText = () => {
    Animated.timing(this.state.shown, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  _hideText = () => {
    Animated.timing(this.state.shown, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  };

  _handleTextLayout = (e: LayoutChangeEvent) => {
    this.props.onLayout && this.props.onLayout(e);
    this.setState({
      textHeight: e.nativeEvent.layout.height,
    });
  };

  render() {
    const {
      style,
      type,
      visible,
      theme,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onLayout,
      padding,
      ...rest
    } = this.props;
    const { colors, dark } = theme;

    const textColor =
      this.props.type === 'error'
        ? colors.error
        : color(colors.text)
            .alpha(dark ? 0.7 : 0.54)
            .rgb()
            .string();

    return (
      <AnimatedText
        onLayout={this._handleTextLayout}
        style={[
          styles.text,
          padding !== 'none' ? styles.padding : {},
          {
            color: textColor,
            opacity: this.state.shown,
            transform:
              visible && type === 'error'
                ? [
                    {
                      translateY: this.state.shown.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-this.state.textHeight / 2, 0],
                      }),
                    },
                  ]
                : [],
          },
          style,
        ]}
        {...rest}
      >
        {this.props.children}
      </AnimatedText>
    );
  }
}

const styles = StyleSheet.create({
  text: {
    fontSize: 12,
    paddingVertical: 4,
  },
  padding: {
    paddingHorizontal: 12,
  },
});

export default withTheme(HelperText);
