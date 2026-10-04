import { StyleSheet, Text, View } from "react-native";
import { Place } from "../store";
import { colors } from "../theme";

type Props = {
  places: Place[];
  onOpen: (id: string) => void;
};

export default function AllMap(_props: Props) {
  return (
    <View style={styles.box}>
      <Text style={styles.text}>The all-places map works on the phone.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  text: {
    fontSize: 15,
    color: colors.mutedText,
    textAlign: "center",
  },
});