import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, FAB, Portal, withTheme, Theme } from 'react-native-paper';

type Props = {
  theme: Theme;
};

type State = {
  visible: boolean;
  open: boolean;
};

class ButtonExample extends React.Component<Props, State> {
  static title = 'Floating Action Button';

  state = {
    visible: true,
    open: false,
  };

  render() {
    const {
      theme: {
        colors: { background },
      },
    } = this.props;

    return (
      <View style={[styles.container, { backgroundColor: background }]}>
        <View style={styles.row}>
          <FAB
            small
            icon={this.state.visible ? 'visibility-off' : 'visibility'}
            style={styles.fab}
            onPress={() => {
              this.setState({
                visible: !this.state.visible,
              });
            }}
          />
        </View>

        <View style={styles.row}>
          <FAB
            icon="favorite"
            style={styles.fab}
            onPress={() => {}}
            visible={this.state.visible}
          />
          <FAB
            icon="done"
            label="Extended FAB"
            style={styles.fab}
            onPress={() => {}}
            visible={this.state.visible}
          />
          <FAB
            icon="cancel"
            label="Disabled FAB"
            style={styles.fab}
            onPress={() => {}}
            visible={this.state.visible}
            disabled
          />

          <FAB
            icon="cancel"
            label="Loading FAB"
            style={styles.fab}
            onPress={() => {}}
            visible={this.state.visible}
            loading
          />
          <Portal>
            <FAB.Group
              open={this.state.open}
              icon={this.state.open ? 'today' : 'add'}
              onStateChange={({ open }: { open: boolean }) =>
                this.setState({ open })
              }
              onPress={() => {
                if (this.state.open) {
                  // do something if the speed dial is open
                }
              }}
              visible={this.state.visible}
            >
              <FAB small icon="add" onPress={() => {}} />
              <FAB small icon="star" label="Star" onPress={() => {}} />
              <FAB small icon="email" label="Email" onPress={() => {}} />
              <FAB
                small
                icon="notifications"
                label="Remind"
                onPress={() => {}}
              />
            </FAB.Group>
          </Portal>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.grey200,
    padding: 4,
  },

  row: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  fab: {
    margin: 8,
  },
});

export default withTheme(ButtonExample);
