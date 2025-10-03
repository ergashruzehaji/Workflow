const express = require('express');
const crypto = require('crypto');
const router = express.Router();

function createGithubRoutes(workflowService) {
  // Verify GitHub webhook signature
  function verifySignature(req, res, next) {
    const signature = req.headers['x-hub-signature-256'];
    const secret = process.env.GITHUB_WEBHOOK_SECRET;

    if (!secret) {
      // If no secret is configured, skip verification (development mode)
      return next();
    }

    if (!signature) {
      return res.status(401).json({
        success: false,
        error: 'Missing signature'
      });
    }

    const body = JSON.stringify(req.body);
    const hmac = crypto.createHmac('sha256', secret);
    const digest = 'sha256=' + hmac.update(body).digest('hex');

    if (signature !== digest) {
      return res.status(401).json({
        success: false,
        error: 'Invalid signature'
      });
    }

    next();
  }

  // GitHub webhook endpoint
  router.post('/webhook', express.json({ verify: (req, res, buf) => { req.rawBody = buf; } }), verifySignature, (req, res) => {
    try {
      const event = req.headers['x-github-event'];
      const payload = req.body;

      console.log(`Received GitHub webhook: ${event}`);

      let context = {
        event,
        repository: payload.repository?.full_name,
        sender: payload.sender?.login
      };

      switch (event) {
        case 'issues':
          context = {
            ...context,
            action: payload.action,
            issue_number: payload.issue?.number,
            issue_title: payload.issue?.title,
            issue_state: payload.issue?.state,
            assignee: payload.issue?.assignee?.login
          };
          workflowService.triggerWorkflows('github_issue', context);
          break;

        case 'pull_request':
          context = {
            ...context,
            action: payload.action,
            pr_number: payload.pull_request?.number,
            pr_title: payload.pull_request?.title,
            pr_state: payload.pull_request?.state,
            author: payload.pull_request?.user?.login
          };
          workflowService.triggerWorkflows('github_pr', context);
          break;

        case 'push':
          context = {
            ...context,
            ref: payload.ref,
            branch: payload.ref?.replace('refs/heads/', ''),
            commits_count: payload.commits?.length,
            pusher: payload.pusher?.name
          };
          workflowService.triggerWorkflows('github_push', context);
          break;

        case 'release':
          context = {
            ...context,
            action: payload.action,
            release_name: payload.release?.name,
            release_tag: payload.release?.tag_name
          };
          workflowService.triggerWorkflows('github_release', context);
          break;

        default:
          console.log(`Unhandled GitHub event: ${event}`);
      }

      res.json({
        success: true,
        message: 'Webhook received',
        event
      });
    } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  return router;
}

module.exports = createGithubRoutes;
