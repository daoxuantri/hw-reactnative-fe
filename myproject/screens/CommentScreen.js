// CommentScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CommentScreen = ({ route, navigation }) => {
  const { product , onCommentSubmit } = route.params; // Nhận thông tin sản phẩm từ tham số
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  

  const handleCommentSubmit = async () => {
    if (!comment) {
      alert('Vui lòng nhập bình luận.');
      return;
    }

    try {
      const storedUserData = await AsyncStorage.getItem('userData');
      const userData = JSON.parse(storedUserData);
      const userId = userData.id;

      const response = await fetch('http://192.168.2.183:4000/reviews/createreview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          productId: product._id,
          content: comment,
          rating: rating,
        }),
      });

      const responseJson = await response.json();
      if (responseJson.success) {
        alert('Bình luận đã được gửi thành công!');
        onCommentSubmit(); // Gọi callback để cập nhật lại dữ liệu
        navigation.goBack(); // Quay lại trang chi tiết sản phẩm
      } else {
        alert(responseJson.message);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nhập bình luận của bạn</Text>
      <TextInput
        style={styles.commentInput}
        placeholder="Viết bình luận của bạn..."
        value={comment}
        onChangeText={setComment}
      />
      <View style={styles.starRatingContainer}>
        <Text>Chọn số sao:</Text>
        <View style={styles.starsContainer}>
          {[...Array(5)].map((_, index) => (
            <Icon
              key={index}
              name={index < rating ? 'star' : 'star-border'}
              size={32}
              color="#FFD700"
              onPress={() => setRating(index + 1)}
            />
          ))}
        </View>
      </View>
      <Button title="Gửi bình luận" onPress={handleCommentSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  commentInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  starRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  starsContainer: {
    flexDirection: 'row',
    marginLeft: 10,
  },
});

export default CommentScreen;
