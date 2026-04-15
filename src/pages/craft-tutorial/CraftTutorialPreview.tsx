import { useLandingPageState } from "@/hooks/useLandingPage";

const CraftTutorialPreview = () => {
  const { data: savedState, isLoading } = useLandingPageState();

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <div>Cargando...</div>
      </div>
    );
  }

  return <div dangerouslySetInnerHTML={{ __html: savedState.html_content }} />;
};

export default CraftTutorialPreview;
