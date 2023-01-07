const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')
const api = supertest(app)

describe( 'Users', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    await new User(helper.user1).save()
  })
  describe( 'GET', ()=>{
    test('request is working', async () => {
      await api
        .get('/api/users')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })
    test('there is one user', async () => {
      const response = await api.get('/api/users')
      expect(response.body).toHaveLength(1)
    })
  })
  describe('POST', ()=>{
    test('request is working', async () => {
      await api
        .post('/api/users')
        .send(helper.user2)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const response = await api.get('/api/users')

      expect(response.body).toHaveLength(2)
    })

    test('Username has to be unique', async() => {
      await api
        .post('/api/users')
        .send(helper.user3)
        .expect(400)
    })

    test('Username and password have to be longer than 3 characters', async() => {
      await api
        .post('/api/users')
        .send(helper.shortUsername)
        .expect(400)

      await api
        .post('/api/users')
        .send(helper.shortPswd)
        .expect(400)
    })

  })
})
describe( 'Blogposts', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})    
    let BlogObjects = helper.initialBlogs.map(blog => new Blog(blog))
    let promiseArray = BlogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
  })

  describe( 'GET', ()=>{
    test('request is working', async () => {
      await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })
    
    test('there are two notes', async () => {
      const response = await api.get('/api/blogs')
    
      expect(response.body).toHaveLength(2)
    })

    test('proper id key', async ()=>{
      const response = await api.get('/api/blogs')
      expect(response.body[0].id).toBeDefined()
    })
  })

  describe( 'POST', ()=> {

    test('request is working', async () => {
      const userdata = await api.post('/api/login').send({username: 'lepanderus', password: 'mummomies'})
      const token = `bearer ${userdata.body.token.toString()}`
      await api
        .post('/api/blogs')
        .send(helper.properPost)
        .set('Authorization', token)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const response = await api.get('/api/blogs')
    
      expect(response.body).toHaveLength(3)
    })

    test('no likes value get set to 0', async () => {
      const userdata = await api.post('/api/login').send({username: 'lepanderus', password: 'mummomies'})
      const token = `bearer ${userdata.body.token.toString()}`
      const response = await api.post('/api/blogs').send(helper.noLikes).set('Authorization', token)
      expect(response.body.likes).toBe(0)
    })

    test('should throw badrequest error when no title is given', async () => {
      const userdata = await api.post('/api/login').send({username: 'lepanderus', password: 'mummomies'})
      const token = `bearer ${userdata.body.token.toString()}`
      await api.post('/api/blogs').send(helper.noTitle).set('Authorization', token).expect(400)
    })

    test('should throw badrequest error when no url is given', async () => {
      const userdata = await api.post('/api/login').send({username: 'lepanderus', password: 'mummomies'})
      const token = `bearer ${userdata.body.token.toString()}`
      await api.post('/api/blogs').send(helper.noUrl).set('Authorization', token).expect(400)
    })

    test('should throw unauthorizes error when no token is giben', async () =>{
      await api
        .post('/api/blogs')
        .send(helper.properPost)
        .expect(401)
    })

  })

  describe( 'PUT', () => {
    const updateBlog ={
      _id: '5a422a851b54a676234d17f7',
      title: 'React patterns',
      author: 'Michael Chan',
      url: 'https://reactpatterns.com/',
      likes: 10,
      __v: 0
    }

    test('updates the likes of a blog post', async () => {
      await api.put(`/api/blogs/${updateBlog._id}`).send(updateBlog).expect(200)
      const response = await api.get(`/api/blogs/${updateBlog._id}`)
      expect(response.body.likes).toBe(10)
      
    })
    test('does not increase the length of list', async () => {
      await api.put(`/api/blogs/${updateBlog._id}`).send(updateBlog).expect(200)
      const response = await api.get('/api/blogs')
      expect(response.body).toHaveLength(2)
    })
  })

  describe('DELETE', () => {
    const id = '5a422a851b54a676234d17f7'
    test('request is working', async () => {
      const userdata = await api.post('/api/login').send({username: 'lepanderus', password: 'mummomies'})
      const token = `bearer ${userdata.body.token.toString()}`
      await api.delete(`/api/blogs/${id}`).set('Authorization', token).expect(204)
    })
    test('decreases length of list by one', async () => {
      const userdata = await api.post('/api/login').send({username: 'lepanderus', password: 'mummomies'})
      const token = `bearer ${userdata.body.token.toString()}`
      await api.delete(`/api/blogs/${id}`).set('Authorization', token)
      const response = await api.get('/api/blogs')
      expect(response.body).toHaveLength(1)
    })
  })
})

afterAll(() => {
  mongoose.connection.close()
})