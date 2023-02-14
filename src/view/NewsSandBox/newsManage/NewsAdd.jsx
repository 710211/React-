import style from './News.module.css'
import React, { useState, useEffect, useRef } from 'react'
import { withRouter } from 'react-router-dom'
import { Steps, Button, Form, Input, Select, message, notification } from 'antd';
import NewsEditor from '../../../components/NewsEditor/NewsEditor';
import axios from 'axios'
function NewsAdd(props) {
  const [current, setCurrent] = useState(0)
  const [categoryList, setCategoryList] = useState([])
  // 收集表单信息
  const [formInfo, setFormInfo] = useState({})
  // 收集文本信息
  const [content, setContent] = useState('')
  const user = JSON.parse(localStorage.getItem("token"))
  const NewsForm = useRef(null)
  useEffect(() => {
    axios.get('/categories').then(res => {
      setCategoryList(res.data)
    })
  }, [])
  const handleNext = () => {
    if (current === 0) {
      // 验证form表单中的都填了
      NewsForm.current.validateFields().then(res => {
        setFormInfo(res)
        setCurrent(current + 1)
      }).catch(err => {
      })
    } else {
      if (content === "" || content.trim() === "<p></p>") {
        message.error("新闻内容不能为空")
      } else {
        // console.log(formInfo, content)

        setCurrent(current + 1)
      }
    }

  }
  const handlePervious = () => {
    setCurrent(current - 1)
  }
  const onFinish = (values) => {
    console.log('Success:', values);
  };
  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };
  const items = [
    {
      title: "基本信息",
      description: "新闻标题，新闻分类"
    },
    {
      title: "新闻内容",
      description: "新闻主体内容"
    },
    {
      title: "新闻提交",
      description: "保存草稿或者提交审核"
    }
  ]
  const handleSave = (auditState) => {
    formInfo.categoryId = categoryList.filter(item => item.title === formInfo.categoryId)[0].id
    // console.log(formInfo)
    axios.post('/news', {
      ...formInfo,
      "content": content,
      "region": user.region ? user.region : "全球",
      "author": user.username,
      "roleId": user.roleId,
      "auditState": auditState,
      "publishState": 0,
      "createTime": Date.now(),
      "star": 0,
      "view": 0,
      // "publishTime": 0
    }).then(res => {
      notification.open({
        message: `通知`,
        description: `你可以到${auditState === 0 ? "草稿箱" : "审核列表"}中查看你的新闻`,
        placement: "bottomRight",
        duration: 3
      });
      props.history.push(auditState === 0 ? '/news-manage/draft' : '/audit-manage/list')
    })
  }
  return (
    <div>
      <h3>撰写新闻</h3>
      <Steps current={current} items={items} />
      <div style={{ marginTop: '50px' }}>
        <div className={current === 0 ? '' : style.hidden}>
          <Form
            ref={NewsForm}
            name="basic"
            // labelCol，wrapperCol标题跟内容区的大小
            labelCol={{
              span: 4,
            }}
            wrapperCol={{
              span: 20,
            }}
            initialValues={{
              remember: true,
            }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Form.Item
              label="新闻标题"
              name="title"
              rules={[
                {
                  required: true,
                  message: 'Please input your username!',
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="新闻分类"
              name="categoryId"
              rules={[
                {
                  required: true,
                  message: 'Please input your username!',
                },
              ]}
            >
              <Select
                style={{
                  width: '100%',
                }}
                options={categoryList}
              />
            </Form.Item>
          </Form>
        </div>
        {/* 富文本编辑器 */}
        <div className={current === 1 ? '' : style.hidden}>
          <NewsEditor getContent={(value) => {
            setContent(value)
          }} />
        </div>
        <div className={current === 2 ? '' : style.hidden}></div>
      </div>
      <div style={{ marginTop: "30px" }}>
        {
          current > 0 && <Button type='primary' onClick={handlePervious}>上一步</Button>
        }
        {
          current < 2 && <Button type='primary' onClick={handleNext}>下一步</Button>
        }
        {
          current === 2 && <span>
            <Button type='primary' onClick={() => handleSave(0)}>保存草稿</Button>
            <Button type='primary' danger onClick={() => handleSave(1)}>提交审核</Button>
          </span>
        }
      </div>
    </div>
  )
}
export default withRouter(NewsAdd)