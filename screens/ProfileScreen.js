import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import FormButton from '../components/FormButton';
import { AuthContext } from "../navigation/AuthProvider";

import firestore from '@react-native-firebase/firestore';
import PostCard from '../components/PostCard';

import { Ionicons } from "@expo/vector-icons";

const ProfileScreen = ({navigation, route}) => {
    const {user, logout} = useContext(AuthContext);

    const[posts, setPosts] = useState([]);
    const[loading, setLoading] = useState(true);
    const[deleted, setDeleted] = useState(false);  
    const [userData, setUserData] = useState(null);

    const fetchPosts = async() => {
        try {
            const  list = [];

            await firestore()
            .collection('posts')
            .where('userId', '==', route.params ? route.params.userId : user.uid)
            .orderBy('postTime', 'desc')
            .get()
            .then((querySnapshot) => {
                // console.log('Total Posts: ', querySnapshot.size);

                querySnapshot.forEach(doc => {
                    const {userId, post, postImg, postTime, likes, comments} = doc.data();
                    list.push({
                        id: doc.id,
                        userId,
                        userName: 'Test Name',
                        userImg: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png',
                        postTime: postTime,
                        post,
                        postImg,
                        liked: false,
                        likes,
                        comments
                    });
                })
            })
            
            setPosts(list);

            if(loading) {
                setLoading(false);
            }

            console.log('Posts: ', posts);

        } catch(e) {
            console.log(e);
        }
    }

    const getUser = async() => {
        await firestore()
        .collection('users')
        .doc(route.params ? route.params.userId : user.uid)
        .get()
        .then((documentSnapshot) => {
            if( documentSnapshot.exists ) {
                console.log('User Data', documentSnapshot.data());
                setUserData(documentSnapshot.data());
            }
        })
    }

    useEffect(() => {
        getUser();
        fetchPosts();
        navigation.addListener("focus", () => setLoading(!loading));
    }, [navigation, loading]);

    const handleDelete = () => {}

    return (
        <SafeAreaView style={{flex:1, backgroundColor:'#fff'}}>
            <View style={{flexDirection: 'row'}}> 
                <TouchableOpacity onPress={() => {navigation.navigate('Rewards')}} style={{paddingLeft: 15, alignItems: 'flex-start'}} >
                    <Ionicons name="ios-podium-outline" size={25} color='#2e64e5'/>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {navigation.navigate('Guidelines')}} style={{paddingLeft: 310, alignItems: 'flex-end'}} >
                    <Ionicons name="ios-information-circle-outline" size={30} color='#2e64e5'/>
                </TouchableOpacity>
            </View>
            <ScrollView
                style={styles.container}
                contentContainerStyle={{justifyContent: 'center', alignItems: 'center'}}
                showsVerticalScrollIndicator={false}>
                <Image 
                    style={styles.userImg} 
                    source={{uri: userData ? userData.userImg || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png' : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png'}}
                />
                <Text style={styles.userName}>{userData ? userData.fname || 'Test' : 'Test'} {userData ? userData.lname || 'User' : 'User'}</Text>
                {/* <Text>{route.params ? route.params.userId : user.uid}</Text> */}
                <Text style={styles.aboutUser}>
                {userData ? userData.about || 'No details added' : ''}
                </Text>
                <View style={styles.userBtnWrapper}>
                    {route.params ? (
                    <>
                        <TouchableOpacity style={styles.userBtn} onPress={() => {}}>
                            <Text style={styles.userBtnTxt}>Message</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.userBtn} onPress={() => {}}>
                            <Text style={styles.userBtnTxt}>Follow</Text>
                        </TouchableOpacity>
                    </>    
                    ) : (
                    <>
                        <TouchableOpacity style={styles.userBtn} onPress={() => {navigation.navigate('EditProfile')}}>
                            <Text style={styles.userBtnTxt}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.userBtn} onPress={() => logout()}>
                            <Text style={styles.userBtnTxt}>Logout</Text>
                        </TouchableOpacity>
                    </>                         
                    )}
                </View>

                <View style={styles.userInfoWrapper}>
                    <View style={styles.userInfoItem}>
                        <Text style={styles.userInfoTitle}>{posts.length}</Text>
                        <Text style={styles.userInfoSubTitle}>Posts</Text>
                    </View>
                    <View style={styles.userInfoItem}>
                        <Text style={styles.userInfoTitle}>100</Text>
                        <Text style={styles.userInfoSubTitle}>Followers</Text>
                    </View>
                    <View style={styles.userInfoItem}>
                        <Text style={styles.userInfoTitle}>100</Text>
                        <Text style={styles.userInfoSubTitle}>Following</Text>
                    </View>
                </View>

                {posts.map((item) => (
                    <PostCard key={item.id} item={item} onDelete={handleDelete}/>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      padding: 20,
    },
    userImg: {
      height: 150,
      width: 150,
      borderRadius: 75,
    },
    userName: {
      fontSize: 20,
      fontWeight: 'bold', // Comment this to Choose Font
      marginTop: 10,
      marginBottom: 5,
    //   fontFamily: 'supergroteska-rg', // Uncomment this to use this Font
    },
    aboutUser: {
      fontSize: 12,
      fontWeight: '600',
      color: '#666',
      textAlign: 'center',
      marginBottom: 10,
    },
    userBtnWrapper: {
      flexDirection: 'row',
      justifyContent: 'center',
      width: '100%',
      marginBottom: 10,
    },
    userBtn: {
      borderColor: '#2e64e5',
      borderWidth: 2,
      borderRadius: 3,
      paddingVertical: 8,
      paddingHorizontal: 12,
      marginHorizontal: 5,
    },
    userBtnTxt: {
      color: '#2e64e5',
    },
    userInfoWrapper: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      marginVertical: 20,
    },
    userInfoItem: {
      justifyContent: 'center',
    },
    userInfoTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 5,
      textAlign: 'center',
    },
    userInfoSubTitle: {
      fontSize: 12,
      color: '#666',
      textAlign: 'center',
    },
  });