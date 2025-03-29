const express = require("express");
const connectDB = require("./config/db");
const apiKeyMiddleware = require("./middleware/apiKey");
const chalk = require("chalk");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const app = express();

// Importing v130 Routes
const indexRoutes = require("./routes/indexRoutes");

// Clear console before starting
console.clear();

// Security middleware
app.use(helmet());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json({ limit: "10kb" }));
app.use(apiKeyMiddleware); // Apply API key check to all incoming requests

// Routes
app.use("/rest-api/v130", indexRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.clear();
  console.log("\x1b[32m%s\x1b[0m", "🚀 Server Status: " + "\x1b[34mOnline\x1b[0m");
  console.log("\x1b[33m%s\x1b[0m", "📡 Port: " + "\x1b[36m" + PORT + "\x1b[0m");
  console.log("\x1b[35m%s\x1b[0m", "⏰ Time: " + "\x1b[37m" + new Date().toLocaleString() + "\x1b[0m");
  console.log("\x1b[31m%s\x1b[0m", "⚡ Environment: " + "\x1b[37m" + (process.env.NODE_ENV || "development") + "\x1b[0m");
  console.log("\x1b[36m%s\x1b[0m", "🛣️  Routes: ");
  console.log("\x1b[37m%s\x1b[0m", "   - /rest-api/v130");
});


// function signup($param1='', $param2='')  {
//   if ($param1 == 'do_signup') {
//       $username               = $this->input->post('username');
//       $email                  = $this->input->post('email');
//       $password               = $this->input->post('password');
//       $data['name']           = 'User';
//       $data['email']          = $email;
//       $data['username']       = $username;
//       $data['password']       = md5($password );
//       $data['role']           = 'subscriber';
//       $user_exist             = $this->common_model->check_email_username($username,$email);
//       if($user_exist){
//           $this->session->set_flashdata('error', 'Signup fail.username or email is already exist on system');
          
//       }else{
//           $data['join_date']       = date('Y-m-d H:i:s');
//           $data['last_login']       = date('Y-m-d H:i:s');
//           $this->db->insert('user', $data);
//           $this->load->model('email_model');
//           $this->email_model->account_opening_email($username, $email, $password);
//           $this->session->set_flashdata('success', 'Signup successfully.now you can login to system');
//           $response['login_status']       = $login_status;
//           redirect(base_url() . 'login', 'refresh');
//       }     
      
      
//   }      
  
//       $data['page_name']      = 'signup';
//       $data['page_title']     = 'Join with us ';            
//       $this->load->view('signup', $data);

// }





/*


`channel_id`, `channel_name`, `user_id`, `deactivate_reason`, `last_login`, `join_date`, `status`, `doc3`, `doc2`, `doc1`, `mobile_number`, `organization_address`, `address`, `organization_name`, `last_name`, `first_name`, `email`, `PASSWORD`, `img`, `created_at`, `updated_at`
*/