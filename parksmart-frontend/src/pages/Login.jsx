import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BASE_URL } from "@/api/apiConfig";
import { FcGoogle } from 'react-icons/fc';
import {
  FaFacebookF,
  FaGithub,
  FaLinkedinIn
} from "react-icons/fa";

export default function Login() {
  
  const navigate = useNavigate();
  const location = useLocation();
  const [isRegister, setIsRegister] = useState(location.pathname === "/register");
  const [name, setName] = useState("");
const [password, setPassword] = useState("");
const [email, setEmail] = useState("");

  useEffect(() => {
    fetch(`${BASE_URL}/auth/me`, { credentials: "include" })
      .then(res => res.ok ? res.json() : null)
      .then(user => {
        if (user?.role === "ADMIN") navigate("/admin");
        else if (user?.role === "USER") navigate("/user-dashboard");
      })
      .catch(() => {});
  }, []);

  const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    if (!response.ok) {
      alert("Invalid email or password");
      return;
    }

    const user = await response.json();

    if (user.role === "ADMIN") {
      navigate("/admin");
    } else {
      navigate("/user-dashboard");
    }
  } catch (error) {
    console.error("Login error:", error);
    alert("Unable to login. Please try again.");
  }
};

useEffect(() => {
  setIsRegister(location.pathname === "/register");
}, [location.pathname]);

const handleRegister = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        name: name,
        email: email,
        password: password,
      }),
    });

    if (!response.ok) {
      const message = await response.text();
      alert(message || "Registration failed");
      return;
    }

    const user = await response.json();

    alert("Registration successful!");

    // Redirect based on role
    if (user.role === "ADMIN") {
      navigate("/admin");
    } else {
      navigate("/user-dashboard");
    }
  } catch (error) {
    console.error("Registration error:", error);
    alert("Unable to register. Please try again.");
  }
};

const handleGoogleLogin = () => {
  const apiUrl =
    import.meta.env.VITE_API_URL || "http://localhost:8080/api";

  const backendUrl = apiUrl.replace(/\/api\/?$/, "");

  window.location.href = `${backendUrl}/oauth2/authorization/google`;
};

const renderSocialIcons = () => (
  <div className="social-icons">
    <button
      type="button"
      onClick={handleGoogleLogin}
      className="social-login-btn"
      aria-label="Continue with Google"
    >
      <FcGoogle style={{ width: '100%', height: '100%', display: 'block' }} />
    </button>
    <a href="#" aria-label="Facebook">
      <FaFacebookF />
    </a>
    <a href="#" aria-label="GitHub">
      <FaGithub />
    </a>
    <a href="#" aria-label="LinkedIn">
      <FaLinkedinIn />
    </a>
  </div>
);

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: "Poppins", sans-serif;
        }

        .login-page {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(90deg, #e2e2e2, #c9d6ff);
        }
          .brand-logo {
  position: absolute;
  top: 25px;
  left: 25px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.brand-logo .brand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #7c3aed;
  color: #ffffff;
  font-weight: 700;
  font-size: 16px;
}

.brand-logo .brand-text {
  font-size: 22px;
  font-weight: 700;
  color: #333333;
}

.brand-logo .brand-text span {
  color: #7c3aed;
  font-weight: 600;
}

.container {
  position: relative;
  width: 850px;
  height: 550px;
  background: #fff;
  border-radius: 30px;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.2);
  margin: 20px;
  overflow: hidden;
}

.form-box {
  position: absolute;
  right: 0;
  width: 50%;
  height: 100%;
  background: #fff;
  display: flex;
  align-items: center;
  color: #333;
  text-align: center;
  padding: 40px;
  z-index: 1;
  transition: 0.6s ease-in-out 1.2s, visibility 0s 1s;
}

.container.active .form-box {
  right: 50%;
}

.form-box.register {
  visibility: hidden;
}

.container.active .form-box.register {
  visibility: visible;
}
form {
  width: 100%;
}

.container h1 {
  font-size: 36px;
  margin: 10px 0;
}

.input-box {
  position: relative;
  margin: 30px 0;
}

.input-box input {
  width: 100%;
  padding: 13px 50px 13px 20px;
  background: #eee;
  border-radius: 8px;
  border: none;
  outline: none;
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.input-box input::placeholder {
  color: #888;
  font-weight: 400;
}

.input-box i {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px;
  color: #333;
}

.forgot-link {
  margin: -15px 0 15px;
}

.forgot-link a {
  font-size: 14.5px;
  color: #eee;
  text-decoration: none;
}

.btn {
  width: 100%;
  height: 48px;
  background-color: #7c3aed;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #fff;
  font-weight: 600;
}

.container p {
  font-size: 14.5px;
  margin: 15px 0;
}

.social-icons {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.social-icons button,
.social-icons a {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 45px;
  height: 45px;
  border: 2px solid #ccc;
  border-radius: 8px;
  font-size: 22px;
  color: #333;
  background: transparent;
  cursor: pointer;
  text-decoration: none;
  padding: 10px; 
}

.social-icons button:hover,
.social-icons a:hover {
  border-color: #7c3aed;
}

.social-login-btn {
  padding: 0 !important;
}

.social-login-btn svg {
  width: 22px !important;
  height: 22px !important;
  display: block !important;
}
.toggle-box {
  position: absolute;
  width: 100%;
  height: 100%;
}

.toggle-box::before {
  content: "";
  position: absolute;
  left: -250%;
  width: 300%;
  height: 100%;
  background: linear-gradient(90deg, #6e33d8, #8547e4);
  border-radius: 150px;
  z-index: 2;
  transition: 1.8s ease-in-out;
}

.container.active .toggle-box::before {
  left: 50%;
}

.toggle-panel {
  position: absolute;
  width: 50%;
  height: 100%;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 2;
}

.toggle-panel.toggle-left {
  left: 0;
  transition-delay: 1.2s;
}
.container.active .toggle-panel.toggle-left {
  left: -50%;
  transition-delay: 0.6s;
}

.toggle-panel.toggle-right {
  right: -50%;
  transition-delay: 0.6s;
}
.container.active .toggle-panel.toggle-right {
  right: 0;
  transition-delay: 1.2s;
}

.toggle-panel p {
  margin-bottom: 20px;
}

.toggle-panel .btn {
  width: 160px;
  height: 46px;
  background: transparent;
  border: 2px solid #fff;
  box-shadow: none;
}

@media screen and (max-width: 650px) {
  .container {
    height: calc(100vh - 40px);
  }

  .form-box {
    bottom: 0;
    width: 100%;
    height: 70%;
  }

  .container.active .form-box {
    right: 0;
    bottom: 30%;
  }

  .toggle-box::before {
    left: 0;
    top: -270%;
    width: 100%;
    height: 300%;
  }

  .container.active .toggle-box::before {
    left: 0;
    top: 70%;
  }
  .toggle-panel {
    width: 100%;
    height: 30%;
  }

  .toggle-panel.toggle-left {
    top: 0;
  }

  .container.active .toggle-panel.toggle-left {
    left: 0;
    top: -30%;
  }

  .toggle-panel.toggle-right {
    right: 0;
    bottom: -30%;
  }

  .container.active .toggle-panel.toggle-right {
    bottom: 0;
  }
}

@media screen and (max-width: 450px) {
  .form-box {
    padding: 20px;
  }

  .toggle-panel h1 {
    font-size: 30px;
  }
}
  `}</style>
    <div className="login-page">
      {/* Brand Logo */}
      <div
  className="brand-logo"
  onClick={() => navigate("/")}
>
  <span className="brand-icon">P</span>

  <span className="brand-text">
    Park<span>Smart</span>
  </span>
</div>

      <div className={`container ${isRegister ? "active" : ""}`}>
        {/* Login Form */}
        <div className="form-box login">
          <form onSubmit={handleLogin}>
            <h1>Login</h1>

            <div className="input-box">
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <i className="bx bxs-user"></i>
            </div>

            <div className="input-box">
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <i className="bx bxs-lock-alt"></i>
            </div>

            <div className="forgot-link">
              <a href="#">Forgot password?</a>
            </div>

            <button type="submit" className="btn">
              Login
            </button>

            <p>or login with social platforms</p>

            {renderSocialIcons()}
          </form>
        </div>

        {/* Registration Form */}
        <div className="form-box register">
          <form onSubmit={handleRegister}>
            <h1>Registration</h1>

            <div className="input-box">
              <input type="text" placeholder="Username" value={name} onChange={(e) => setName(e.target.value)} required />
              <i className="bx bxs-user"></i>
            </div>

            <div className="input-box">
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <i className="bx bxs-envelope"></i>
            </div>

            <div className="input-box">
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <i className="bx bxs-lock-alt"></i>
            </div>

            <button type="submit" className="btn">
              Register
            </button>

            <p>or Register with social platforms</p>

            {renderSocialIcons()}
          </form>
        </div>

        {/* Toggle Section */}
        <div className="toggle-box">
          <div className="toggle-panel toggle-left">
            <h1>Hello, Welcome!</h1>
            <p>Don't have an account?</p>
            <button
              type="button"
              className="btn register-btn"
              onClick={() => navigate("/register")}
            >
              Register
            </button>
          </div>

          <div className="toggle-panel toggle-right">
            <h1>Welcome Back!</h1>
            <p>Already have an account?</p>
            <button
              type="button"
              className="btn login-btn"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
