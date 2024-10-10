import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';

import { launchCamera } from 'react-native-image-picker';
import TextRecognition from '@react-native-ml-kit/text-recognition';

const Stack = createStackNavigator();

function SplashScreen({ navigation }) {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace('Home');
    }, 3000);
  }, []);

  return (
    <View style={styles.splashContainer}>
      <Image
        source={require('./assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      {/* <Text style={styles.splashText}>My App</Text> */}
    </View>
  );
}

function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.navigate('ScanID')}
        >
          <Text style={styles.buttonText}>Scan ID Card</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.navigate('AddVisitor')}
        >
          <Text style={styles.buttonText}>Add Visitor</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function ScanIDScreen() {
  const [image, setImage] = useState("");
  const [text, setText] = useState({
    Name: "",
    'Identity Number': ""
  });

  const openCamera = async () => {
    let result = launchCamera({
      mediaType: 'photo'
    }, (result) => {
      if (result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      }
    });
  }

  const recognizeText = async () => {
    if (image != "") {
      const result = await TextRecognition.recognize(image);
      if (result != undefined) {
        let idCardRegex = /\b\d{5}-\d{7}-\d{1}\b/;
        const output = result.text;
        let matchResult = output.match(idCardRegex);

        matchResult = matchResult ? matchResult[0] : "Not Clear Image";
        let parsedData = parseOCRText(result.text);
        parsedData['Identity Number'] = matchResult;
        setText(parsedData);
        console.log(parsedData);
      }
    }
  }

  function parseOCRText(text) {
    const lines = text.split('\n');
    const parsedData = {};
    const keyMap = {
      "Name": "Name", 
    };

    let currentKey = 0;

    for (const line of lines) {
      if (keyMap[line]) {
        currentKey = keyMap[line];
      } else if (currentKey) {
        parsedData[currentKey] = line;
        currentKey = null;
      }
    }

    return parsedData;
  }

  useEffect(() => {
    recognizeText();
  }, [image]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.contentContainer}>
          <TouchableOpacity style={styles.button} onPress={openCamera}>
            <Text style={styles.buttonText}>Open Camera</Text>
          </TouchableOpacity>
          <Text style={styles.resultText}>{text.Name}</Text>
          <Text style={styles.resultText}>{text['Identity Number']}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function AddVisitorScreen() {
  const [name, setName] = useState('');
  const [idNumber, setIdNumber] = useState('');

  const handleSubmit = () => {
    console.log('Submitted:', { name, idNumber });
    // Here you would typically save this data or send it to an API
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.contentContainer}>
          <TextInput
            style={styles.input}
            onChangeText={setName}
            value={name}
            placeholder="Visitor Name"
            placeholderTextColor="#800073"
          />
          <TextInput
            style={styles.input}
            onChangeText={setIdNumber}
            value={idNumber}
            placeholder="ID Card Number"
            keyboardType="numeric"
            placeholderTextColor="#800073"

          />
          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ScanID" component={ScanIDScreen} />
        <Stack.Screen name="AddVisitor" component={AddVisitorScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  splashText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#800073',
  },
  scrollView: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  button: {
    backgroundColor: '#800073',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginBottom: 20,
    width: '80%',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultText: {
    fontSize: 24,
    color: '#800073',
    marginTop: 10,
    textAlign: 'center',
  },
  input: {
    height: 40,
    width: '80%',
    borderColor: '#800073',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
    color: '#800073',

  },
});

export default App;