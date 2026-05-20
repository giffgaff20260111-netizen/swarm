import React from "react";
import { DEFAULT_ADMIN_CREDENTIALS, DEFAULT_USER_CREDENTIALS } from "@/lib/swarm";

export default function LoginPage() {
  return (
    <main className="page">
      <div className="shell">
        <section className="hero">
          <div>
            <h1>登录 Swarm</h1>
            <p>本地 MVP 使用预置账号进入任务工作台。用户名使用邮箱；当前页面展示默认凭据，真实 session 会在持久化接线阶段接入。</p>
          </div>
          <a className="button" href="/">进入任务工作台</a>
        </section>

        <section className="sections" aria-label="默认账号">
          <div className="panel">
            <div className="tile-head">
              <h2>管理员</h2>
              <span className="status">完整执行审计日志</span>
            </div>
            <div className="list">
              <div className="row">
                <span>用户名</span>
                <strong>{DEFAULT_ADMIN_CREDENTIALS.email}</strong>
              </div>
              <div className="row">
                <span>密码</span>
                <strong>{DEFAULT_ADMIN_CREDENTIALS.password}</strong>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="tile-head">
              <h2>普通用户</h2>
              <span className="status">业务级 DAG</span>
            </div>
            <div className="list">
              <div className="row">
                <span>用户名</span>
                <strong>{DEFAULT_USER_CREDENTIALS.email}</strong>
              </div>
              <div className="row">
                <span>密码</span>
                <strong>{DEFAULT_USER_CREDENTIALS.password}</strong>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
