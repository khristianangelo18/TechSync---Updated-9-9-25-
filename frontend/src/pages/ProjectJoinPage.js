// frontend/src/pages/ProjectJoinPage.js
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProjectChallengeInterface from '../components/ProjectChallengeInterface';

const ProjectJoinPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const handleClose = () => {
    // Navigate back to projects or dashboard
    navigate('/projects');
  };

  return (
    <div>
      <ProjectChallengeInterface 
        projectId={projectId} 
        onClose={handleClose}
      />
    </div>
  );
};

export default ProjectJoinPage;